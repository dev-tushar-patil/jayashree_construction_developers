package com.jayashree.service;

import com.jayashree.dto.DashboardDto;
import com.jayashree.dto.DashboardDto.SampleContent;
import com.jayashree.entity.Enums.EnquiryStatus;
import com.jayashree.entity.Enums.ProjectStatus;
import com.jayashree.entity.Enums.ReviewStatus;
import com.jayashree.entity.GalleryImage;
import com.jayashree.entity.Project;
import com.jayashree.entity.Review;
import com.jayashree.repository.EnquiryRepository;
import com.jayashree.repository.GalleryImageRepository;
import com.jayashree.repository.ProjectRepository;
import com.jayashree.repository.ReviewRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DashboardService {

    private final ProjectRepository projects;
    private final GalleryImageRepository gallery;
    private final EnquiryRepository enquiries;
    private final ReviewRepository reviews;
    private final ImageService images;

    public DashboardService(ProjectRepository projects, GalleryImageRepository gallery, EnquiryRepository enquiries,
                            ReviewRepository reviews, ImageService images) {
        this.projects = projects;
        this.gallery = gallery;
        this.enquiries = enquiries;
        this.reviews = reviews;
        this.images = images;
    }

    @Transactional(readOnly = true)
    public DashboardDto overview() {
        PageRequest newestFive = PageRequest.of(0, 5, Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")));
        return new DashboardDto(
                projects.count(),
                projects.countByStatus(ProjectStatus.ONGOING),
                projects.countByStatus(ProjectStatus.COMPLETED),
                projects.countByPublishedTrue(),
                gallery.count(),
                enquiries.count(),
                enquiries.countByStatus(EnquiryStatus.NEW),
                reviews.count(),
                reviews.countByStatus(ReviewStatus.PENDING),
                Math.round(reviews.averageRating(ReviewStatus.APPROVED) * 10) / 10.0,
                sampleCounts(),
                enquiries.findTop5ByOrderByCreatedAtDesc().stream().map(EnquiryService::toDto).toList(),
                projects.search(null, null, null, null, newestFive).map(ProjectService::toSummary).getContent(),
                reviews.search(null, null, newestFive).map(ReviewService::toAdmin).getContent());
    }

    private SampleContent sampleCounts() {
        return new SampleContent(projects.findBySampleTrue().size(), gallery.findBySampleTrue().size(),
                reviews.findBySampleTrue().size());
    }

    /**
     * Permanently removes the demo projects, gallery photos and reviews seeded on first start, so the real
     * business content can take over. Bundled demo images are part of the website build and stay on disk.
     */
    @Transactional
    public SampleContent removeSampleContent() {
        SampleContent removed = sampleCounts();
        List<Review> sampleReviews = reviews.findBySampleTrue();
        reviews.deleteAll(sampleReviews);
        List<GalleryImage> sampleGallery = gallery.findBySampleTrue();
        gallery.deleteAll(sampleGallery);
        List<Project> sampleProjects = projects.findBySampleTrue();
        sampleProjects.forEach(p -> reviews.detachProject(p.getId()));
        projects.deleteAll(sampleProjects);
        projects.flush();
        sampleGallery.forEach(g -> images.delete(g.getUrl(), g.getThumbUrl()));
        sampleProjects.forEach(p -> p.getImages().forEach(i -> images.delete(i.getUrl(), i.getThumbUrl())));
        return removed;
    }
}
