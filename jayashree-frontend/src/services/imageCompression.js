/**
 * Shrinks photos in the browser before upload: a 6 MB phone photo becomes a few hundred KB, so 20 photos upload
 * quickly even on mobile data. Drawing to a canvas also applies the photo's EXIF rotation and drops its metadata.
 * The server still validates, resizes and makes thumbnails; this only saves bandwidth and time.
 */

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ACCEPT_ATTR = ACCEPTED_TYPES.join(',');
const MAX_RAW_BYTES = 40 * 1024 * 1024;
const MAX_SIDE = 2400;
const SKIP_BELOW_BYTES = 1.2 * 1024 * 1024;

export function validateImageFile(file) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `"${file.name}" is not a JPG, PNG or WebP image. (iPhone HEIC photos: set the camera to "Most Compatible", or export as JPG.)`;
  }
  if (file.size > MAX_RAW_BYTES) return `"${file.name}" is larger than 40 MB.`;
  return null;
}

async function decode(file) {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      /* fall through to <img> */
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('decode failed'));
    };
    img.src = url;
  });
}

/** Returns a smaller JPEG File, or the original when it is already small or cannot be processed here. */
export async function compressImage(file) {
  if (file.size <= SKIP_BELOW_BYTES && file.type !== 'image/png') return file;
  try {
    const image = await decode(file);
    const width = image.width;
    const height = image.height;
    const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff'; // JPEG has no transparency
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    image.close?.();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.86));
    if (!blob || blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    return file;
  }
}

/** Splits into groups so each request stays well under the server's size limit. */
export function chunk(items, size) {
  const groups = [];
  for (let i = 0; i < items.length; i += size) groups.push(items.slice(i, i + size));
  return groups;
}
