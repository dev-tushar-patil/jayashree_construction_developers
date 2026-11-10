package com.jayashree.dto;

import com.jayashree.entity.Enums.GalleryCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public final class GalleryDtos {

    private GalleryDtos() {}

    public record GalleryImageDto(Long id, String title, String description, GalleryCategory category, String url,
                                  String thumbUrl, Integer width, Integer height, boolean featured, boolean published,
                                  int sortOrder, boolean sample, Instant createdAt) {}

    public record GalleryUpdateRequest(
            @NotBlank(message = "Please enter a title.") @Size(max = 150) String title,
            @Size(max = 500) String description,
            @NotNull(message = "Please choose a category.") GalleryCategory category,
            boolean featured,
            boolean published,
            int sortOrder) {}
}
