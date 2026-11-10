package com.jayashree.dto;

import com.jayashree.entity.Enums.ProjectCategory;
import com.jayashree.entity.Enums.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public final class ProjectDtos {

    private ProjectDtos() {}

    public record ProjectImageDto(Long id, String url, String thumbUrl, String caption, Integer width, Integer height,
                                  boolean cover, int sortOrder) {}

    /** Card data for lists and the homepage. */
    public record ProjectSummary(Long id, String slug, String name, ProjectCategory category, String shortDescription,
                                 String location, ProjectStatus status, String coverUrl, String coverThumbUrl,
                                 int imageCount, boolean featured, boolean published, boolean sample,
                                 Instant createdAt) {}

    public record ProjectDetail(Long id, String slug, String name, ProjectCategory category, String shortDescription,
                                String description, String location, String mapsUrl, ProjectStatus status,
                                LocalDate startDate, LocalDate completionDate, List<String> features,
                                boolean featured, boolean published, boolean sample, List<ProjectImageDto> images,
                                Instant createdAt, Instant updatedAt) {}

    public record ProjectRequest(
            @NotBlank(message = "Please enter the project name.") @Size(max = 150) String name,
            @NotNull(message = "Please choose a category.") ProjectCategory category,
            @NotBlank(message = "Please add a short description.") @Size(max = 300, message = "Keep it under 300 characters.") String shortDescription,
            @Size(max = 20000) String description,
            @NotBlank(message = "Please enter the location.") @Size(max = 150) String location,
            @Size(max = 1000)
            @Pattern(regexp = "^$|^https://\\S+$", message = "Paste the full Google Maps link, starting with https://")
            String mapsUrl,
            @NotNull(message = "Please choose the status.") ProjectStatus status,
            LocalDate startDate,
            LocalDate completionDate,
            @Size(max = 30, message = "Up to 30 features.") List<@Size(max = 150) String> features,
            boolean featured,
            boolean published) {}

    public record ImageUpdateRequest(@Size(max = 200) String caption) {}
}
