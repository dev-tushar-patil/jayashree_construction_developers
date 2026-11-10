package com.jayashree.dto;

import com.jayashree.entity.Enums.ReviewSource;
import com.jayashree.entity.Enums.ReviewStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public final class ReviewDtos {

    private ReviewDtos() {}

    /** What visitors see. No phone number. */
    public record PublicReview(Long id, String customerName, String photoUrl, int rating, String content,
                               String projectName, String projectSlug, LocalDate reviewDate) {}

    public record AdminReview(Long id, String customerName, String customerPhone, String photoUrl, int rating,
                              String content, Long projectId, String projectName, LocalDate reviewDate,
                              ReviewStatus status, ReviewSource source, boolean featured, boolean visible,
                              int sortOrder, boolean sample) {}

    public record ReviewRequest(
            @NotBlank(message = "Please enter the customer's name.") @Size(max = 120) String customerName,
            @Size(max = 500) String photoUrl,
            @Min(value = 1, message = "Choose 1 to 5 stars.") @Max(value = 5, message = "Choose 1 to 5 stars.") int rating,
            @NotBlank(message = "Please enter the review.") @Size(max = 2000) String content,
            Long projectId,
            @Size(max = 150) String projectName,
            LocalDate reviewDate,
            @NotNull ReviewStatus status,
            boolean featured,
            boolean visible) {}

    /** A review left by a visitor on the website. It waits for approval. */
    public record ReviewSubmission(
            @NotBlank(message = "Please enter your name.") @Size(max = 120) String customerName,
            @Pattern(regexp = "^$|^[+0-9 ()-]{10,20}$", message = "Please enter a valid mobile number.") String customerPhone,
            @Min(value = 1, message = "Please choose a star rating.") @Max(5) int rating,
            @NotBlank(message = "Please write a few words about your experience.")
            @Size(min = 10, max = 2000, message = "Please write between 10 and 2000 characters.") String content,
            @Size(max = 150) String projectName,
            /** Hidden field that people never fill in; bots often do. */
            @Size(max = 200) String website) {}

    public record ModerationRequest(ReviewStatus status, Boolean featured, Boolean visible) {}
}
