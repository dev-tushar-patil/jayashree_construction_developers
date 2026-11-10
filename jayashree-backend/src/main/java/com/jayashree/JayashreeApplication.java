package com.jayashree;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class JayashreeApplication {

    public static void main(String[] args) {
        SpringApplication.run(JayashreeApplication.class, args);
    }
}
