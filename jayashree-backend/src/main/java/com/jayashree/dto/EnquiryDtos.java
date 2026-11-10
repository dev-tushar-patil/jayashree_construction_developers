package com.jayashree.dto;

import com.jayashree.entity.Enums.EnquiryStatus;
import com.jayashree.entity.Enums.EnquiryType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public final class EnquiryDtos {

    private EnquiryDtos() {}

    /** Shared by the contact form, the quote form and project enquiries; type says which fields matter. */
    public record EnquiryRequest(
            @NotNull EnquiryType type,
            @NotBlank(message = "Please enter your full name.") @Size(max = 120) String fullName,
            @Email(message = "Please enter a valid email address.") @Size(max = 160) String email,
            @NotBlank(message = "Please enter your mobile number.")
            @Pattern(regexp = "^[+0-9 ()-]{10,20}$", message = "Please enter a valid mobile number.") String mobile,
            @Size(max = 120) String interestedIn,
            @Size(max = 150) String projectLocation,
            @Size(max = 60) String constructionType,
            @Size(max = 60) String plotArea,
            @Size(max = 60) String budget,
            @Size(max = 3000, message = "Please keep the message under 3000 characters.") String message,
            Long projectId,
            /** Hidden field that people never fill in; bots often do. */
            @Size(max = 200) String website) {}

    public record EnquiryCreated(Long id) {}

    public record EnquiryDto(Long id, EnquiryType type, String fullName, String email, String mobile,
                             String interestedIn, String projectLocation, String constructionType, String plotArea,
                             String budget, String message, Long projectId, String projectName,
                             EnquiryStatus status, String adminNotes, Instant createdAt, Instant updatedAt) {}

    public record EnquiryUpdateRequest(@NotNull EnquiryStatus status, @Size(max = 5000) String adminNotes) {}
}
