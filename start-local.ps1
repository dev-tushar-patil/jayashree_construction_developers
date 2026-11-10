# Starts Jayashri Construction & Developers on this PC: MySQL 8 on port 3309, the API on 8070 and the website on 5170.
# It does not use or change the MySQL service on port 3306 (version 5.5, too old for this project), nor other projects' ports.
# First run: creates a private database folder and jayashree-backend\.env with random secrets and an admin password.
# Run again any time; whatever is already running is left alone.

param(
    [string]$ToolsDir = "$env:USERPROFILE\.expense-tracker-tools",
    [string]$DataDir = "$env:USERPROFILE\.jayashree\mysql-data",
    [int]$MySqlPort = 3309,
    [int]$ApiPort = 8070,
    [int]$WebPort = 5170,
    [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$backend = Join-Path $root 'jayashree-backend'
$frontend = Join-Path $root 'jayashree-frontend'
$logs = Join-Path $root 'logs'
New-Item -ItemType Directory -Force $logs | Out-Null

function Find-Tool($pattern, $label) {
    $hit = Get-ChildItem $pattern -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $hit) { throw "$label not found at $pattern. Pass -ToolsDir, or see README.md for manual setup." }
    return $hit.FullName
}

function Test-Port($port) {
    # Ask Windows rather than connecting: Vite listens only on IPv6 (::1) and MySQL only on IPv4.
    return [bool](Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
}

function Wait-Port($port, $label, $seconds) {
    $deadline = (Get-Date).AddSeconds($seconds)
    while (-not (Test-Port $port)) {
        if ((Get-Date) -gt $deadline) { throw "$label did not start within $seconds seconds. See the logs folder." }
        Start-Sleep -Seconds 2
    }
}

function New-LogPaths($name) {
    foreach ($suffix in '', '-errors') {
        $current = Join-Path $logs "$name$suffix.log"
        if (Test-Path $current) { Move-Item $current (Join-Path $logs "$name$suffix.previous.log") -Force }
    }
    return @{ RedirectStandardOutput = (Join-Path $logs "$name.log"); RedirectStandardError = (Join-Path $logs "$name-errors.log") }
}

function New-Secret($bytes) {
    $data = New-Object byte[] $bytes
    [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($data)
    return ([Convert]::ToBase64String($data) -replace '[+/=]', 'x')
}

$jdk = Find-Tool "$ToolsDir\jdk\jdk-21*" 'JDK 21'
$mysqld = Join-Path (Find-Tool "$ToolsDir\mysql\mysql-8*" 'MySQL 8') 'bin\mysqld.exe'
$maven = Join-Path (Find-Tool "$ToolsDir\maven\apache-maven-*" 'Maven') 'bin\mvn.cmd'
$env:JAVA_HOME = $jdk
$env:PATH = "$jdk\bin;$env:PATH"

# ---- Database -------------------------------------------------------------------------------
if (-not (Test-Path (Join-Path $DataDir 'mysql'))) {
    Write-Host 'Creating the database folder (first run only)...'
    New-Item -ItemType Directory -Force (Split-Path $DataDir) | Out-Null
    # Root has no password, but the server only ever listens on 127.0.0.1 (below).
    $init = Start-Process $mysqld -ArgumentList '--no-defaults', '--initialize-insecure', "--datadir=`"$DataDir`"" -Wait -PassThru -NoNewWindow
    if ($init.ExitCode -ne 0) { throw 'MySQL could not initialise its data folder.' }
}
if (-not (Test-Port $MySqlPort)) {
    Write-Host "Starting MySQL on port $MySqlPort..."
    Start-Process $mysqld -WindowStyle Hidden -ArgumentList '--no-defaults', "--datadir=`"$DataDir`"", "--port=$MySqlPort", '--bind-address=127.0.0.1', '--mysqlx=OFF', '--skip-log-bin'
    Wait-Port $MySqlPort 'MySQL' 120
}

# ---- Backend configuration ------------------------------------------------------------------
$envFile = Join-Path $backend '.env'
if (-not (Test-Path $envFile)) {
    $adminPassword = New-Secret 12
    @(
        "DB_URL=jdbc:mysql://127.0.0.1:$MySqlPort/jayashree?createDatabaseIfNotExist=true&useUnicode=true&characterEncoding=utf8&serverTimezone=UTC&allowPublicKeyRetrieval=true&useSSL=false"
        'DB_USERNAME=root'
        'DB_PASSWORD='
        "JWT_SECRET=$(New-Secret 48)"
        'ADMIN_USERNAME=admin'
        'ADMIN_EMAIL=admin@jayashree.local'
        "ADMIN_PASSWORD=$adminPassword"
        "SERVER_PORT=$ApiPort"
        "CORS_ALLOWED_ORIGINS=http://localhost:$WebPort"
    ) | Set-Content -Path $envFile -Encoding ascii
    Write-Host ''
    Write-Host "Admin login created. Username: admin  Password: $adminPassword" -ForegroundColor Yellow
    Write-Host "(Also saved in $envFile. Change it from Admin > Change Password.)" -ForegroundColor Yellow
    Write-Host ''
}

# ---- Backend --------------------------------------------------------------------------------
$jar = Join-Path $backend 'target\jayashree-backend-1.0.0.jar'
$newestSource = Get-ChildItem (Join-Path $backend 'src'), (Join-Path $backend 'pom.xml') -Recurse -File |
    Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not (Test-Port $ApiPort)) {
    if (-not (Test-Path $jar) -or (Get-Item $jar).LastWriteTime -lt $newestSource.LastWriteTime) {
        Write-Host 'Building the backend (this can take several minutes)...'
        Push-Location $backend
        try {
            & $maven -q -B "-Dmaven.repo.local=$ToolsDir\m2" -DskipTests package
            if ($LASTEXITCODE -ne 0) { throw 'The backend build failed.' }
        } finally { Pop-Location }
    }
    Write-Host "Starting the API on port $ApiPort..."
    $backendLogs = New-LogPaths 'backend'
    Start-Process (Join-Path $jdk 'bin\java.exe') -WorkingDirectory $backend -ArgumentList '-Xmx400m', '-jar', "`"$jar`"" -WindowStyle Hidden @backendLogs
    Write-Host 'This can take a few minutes on a busy PC. Please wait...'
    Wait-Port $ApiPort 'The API' 600
}

# ---- Frontend -------------------------------------------------------------------------------
if (-not (Test-Port $WebPort)) {
    if (-not (Test-Path (Join-Path $frontend 'node_modules'))) {
        Write-Host 'Installing website packages...'
        Push-Location $frontend
        try {
            & npm.cmd install --no-audit --no-fund
            if ($LASTEXITCODE -ne 0) { throw 'npm install failed.' }
        } finally { Pop-Location }
    }
    Write-Host "Starting the website on port $WebPort..."
    $websiteLogs = New-LogPaths 'website'
    Start-Process 'npm.cmd' -WorkingDirectory $frontend -ArgumentList 'run', 'dev' -WindowStyle Hidden @websiteLogs
    Wait-Port $WebPort 'The website' 120
}

Write-Host ''
Write-Host 'Jayashri Construction & Developers is running.' -ForegroundColor Green
Write-Host "  Website: http://localhost:$WebPort"
Write-Host "  Admin:   http://localhost:$WebPort/admin/login  (login is in jayashree-backend\.env)"
Write-Host "  Logs:    $logs"
Write-Host '  To stop: double-click stop-local.cmd'
if (-not $NoBrowser) { Start-Process "http://localhost:$WebPort" }
