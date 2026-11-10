package com.jayashree.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public final class ServiceDtos {

    private ServiceDtos() {}

    public record ServiceDto(Long id, String slug, String title, String shortDescription, String description,
                             String icon, String imageUrl, List<String> features, int sortOrder, boolean published) {}

    public record ServiceRequest(
            @NotBlank(message = "Please enter the service title.") @Size(max = 120) String title,
            @NotBlank(message = "Please add a short description.") @Size(max = 300) String shortDescription,
            @Size(max = 20000) String description,
            @NotBlank @Pattern(regexp = "[a-z-]{2,40}", message = "Choose an icon.") String icon,
            @Size(max = 500) String imageUrl,
            @Size(max = 30) List<@Size(max = 150) String> features,
            boolean published) {}
}
