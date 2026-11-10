package com.jayashree.dto;

import com.jayashree.dto.EnquiryDtos.EnquiryDto;
import com.jayashree.dto.ProjectDtos.ProjectSummary;
import com.jayashree.dto.ReviewDtos.AdminReview;

import java.util.List;

public record DashboardDto(
        long totalProjects,
        long ongoingProjects,
        long completedProjects,
        long publishedProjects,
        long galleryImages,
        long totalEnquiries,
        long newEnquiries,
        long totalReviews,
        long pendingReviews,
        double averageRating,
        SampleContent sampleContent,
        List<EnquiryDto> recentEnquiries,
        List<ProjectSummary> recentProjects,
        List<AdminReview> latestReviews) {

    /** Seeded demo items still on the site; the dashboard offers to remove them. */
    public record SampleContent(long projects, long galleryImages, long reviews) {
        public boolean any() {
            return projects + galleryImages + reviews > 0;
        }
    }
}
