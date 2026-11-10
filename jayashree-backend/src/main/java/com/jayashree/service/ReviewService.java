package com.jayashree.service;

import com.jayashree.dto.CommonDtos.PageResponse;
import com.jayashree.dto.ReviewDtos.AdminReview;
import com.jayashree.dto.ReviewDtos.ModerationRequest;
import com.jayashree.dto.ReviewDtos.PublicReview;
import com.jayashree.dto.ReviewDtos.ReviewRequest;
import com.jayashree.dto.ReviewDtos.ReviewSubmission;
import com.jayashree.entity.Enums.ReviewSource;
import com.jayashree.entity.Enums.ReviewStatus;
import com.jayashree.entity.Project;
import com.jayashree.entity.Review;
import com.jayashree.exception.ApiException;
import com.jayashree.repository.ProjectRepository;
import com.jayashree.repository.ReviewRepository;
import com.jayashree.service.storage.StorageService;
import com.jayashree.util.Text;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Reviews and testimonials. Only APPROVED and visible reviews ever leave the public endpoints.
 * Featured ones form the homepage testimonial slider, in their sortOrder.
 */
@Service
public class ReviewService {

    private static final ZoneId INDIA = ZoneId.of("Asia/Kolkata");
    private static final Sort NEWEST = Sort.by(Sort.Order.desc("reviewDate"), Sort.Order.desc("id"));

    private final ReviewRepository reviews;
    private final ProjectRepository projects;
    private final StorageService storage;

    public ReviewService(ReviewRepository reviews, ProjectRepository projects, StorageService storage) {
        this.reviews = reviews;
        this.projects = projects;
        this.storage = storage;
    }

    // ---------------------------------------------------------------- public

    @Transactional(readOnly = true)
    public PageResponse<PublicReview> publicList(int page, int size) {
        PageRequest request = PageRequest.of(Math.max(0, page), Math.max(1, Math.min(size, 50)), NEWEST);
        return PageResponse.of(reviews.findByStatusAndVisibleTrue(ReviewStatus.APPROVED, request), ReviewService::toPublic);
    }

    /** The homepage slider: featured approved reviews, or the newest approved ones if none are featured. */
    @Transactional(readOnly = true)
    public List<PublicReview> testimonials() {
        List<Review> featured = reviews.findByStatusAndVisibleTrueAndFeaturedTrueOrderBySortOrderAscReviewDateDesc(ReviewStatus.APPROVED);
        if (featured.isEmpty()) {
            featured = reviews.findByStatusAndVisibleTrue(ReviewStatus.APPROVED, PageRequest.of(0, 6, NEWEST)).getContent();
        }
        return featured.stream().map(ReviewService::toPublic).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> summary() {
        long count = reviews.countByStatus(ReviewStatus.APPROVED);
        double average = reviews.averageRating(ReviewStatus.APPROVED);
        return Map.of("count", count, "average", Math.round(average * 10) / 10.0);
    }

    /** A visitor's review. It is stored as PENDING and shows nowhere until an admin approves it. */
    @Transactional
    public void submit(ReviewSubmission submission) {
        if (Text.clean(submission.website()) != null) {
            return; // honeypot filled in: quietly ignore the bot
        }
        Review review = new Review();
        review.setCustomerName(submission.customerName().strip());
        review.setCustomerPhone(Text.clean(submission.customerPhone()));
        review.setRating(submission.rating());
        review.setContent(submission.content().strip());
        review.setProjectName(Text.clean(submission.projectName()));
        review.setReviewDate(LocalDate.now(INDIA));
        review.setStatus(ReviewStatus.PENDING);
        review.setSource(ReviewSource.WEBSITE);
        review.setVisible(true);
        reviews.save(review);
    }

    // ---------------------------------------------------------------- admin

    @Transactional(readOnly = true)
    public PageResponse<AdminReview> adminList(ReviewStatus status, String q, int page, int size) {
        PageRequest request = PageRequest.of(Math.max(0, page), Math.max(1, Math.min(size, 100)),
                Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")));
        return PageResponse.of(reviews.search(status, Text.likePattern(q), request), ReviewService::toAdmin);
    }

    @Transactional(readOnly = true)
    public List<AdminReview> adminTestimonials() {
        return reviews.findByFeaturedTrueOrderBySortOrderAscReviewDateDesc().stream().map(ReviewService::toAdmin).toList();
    }

    @Transactional
    public AdminReview create(ReviewRequest request) {
        Review review = new Review();
        review.setSource(ReviewSource.ADMIN);
        apply(review, request);
        return toAdmin(reviews.save(review));
    }

    @Transactional
    public AdminReview update(Long id, ReviewRequest request) {
        Review review = find(id);
        String oldPhoto = review.getPhotoUrl();
        apply(review, request);
        reviews.flush();
        if (oldPhoto != null && !oldPhoto.equals(review.getPhotoUrl())) {
            storage.delete(oldPhoto);
        }
        return toAdmin(review);
    }

    @Transactional
    public AdminReview moderate(Long id, ModerationRequest request) {
        Review review = find(id);
        if (request.status() != null) {
            review.setStatus(request.status());
        }
        if (request.featured() != null) {
            review.setFeatured(request.featured());
        }
        if (request.visible() != null) {
            review.setVisible(request.visible());
        }
        return toAdmin(review);
    }

    @Transactional
    public void delete(Long id) {
        Review review = find(id);
        reviews.delete(review);
        reviews.flush();
        storage.delete(review.getPhotoUrl());
    }

    @Transactional
    public List<AdminReview> reorderTestimonials(List<Long> ids) {
        Map<Long, Review> byId = reviews.findByFeaturedTrueOrderBySortOrderAscReviewDateDesc().stream()
                .collect(Collectors.toMap(Review::getId, Function.identity()));
        int order = 0;
        for (Long id : ids == null ? List.<Long>of() : ids) {
            Review r = byId.get(id);
            if (r != null) {
                r.setSortOrder(order++);
            }
        }
        reviews.flush();
        return adminTestimonials();
    }

    private void apply(Review review, ReviewRequest r) {
        review.setCustomerName(r.customerName().strip());
        review.setPhotoUrl(Text.clean(r.photoUrl()));
        review.setRating(r.rating());
        review.setContent(r.content().strip());
        Project project = r.projectId() == null ? null
                : projects.findById(r.projectId()).orElseThrow(() -> ApiException.badRequest("That project no longer exists."));
        review.setProject(project);
        review.setProjectName(project != null ? project.getName() : Text.clean(r.projectName()));
        review.setReviewDate(r.reviewDate() != null ? r.reviewDate() : LocalDate.now(INDIA));
        review.setStatus(r.status());
        review.setFeatured(r.featured());
        review.setVisible(r.visible());
    }

    private Review find(Long id) {
        return reviews.findById(id).orElseThrow(() -> ApiException.notFound("Review"));
    }

    static PublicReview toPublic(Review r) {
        Project p = r.getProject();
        boolean linkable = p != null && p.isPublished();
        return new PublicReview(r.getId(), r.getCustomerName(), r.getPhotoUrl(), r.getRating(), r.getContent(),
                r.getProjectName(), linkable ? p.getSlug() : null, r.getReviewDate());
    }

    static AdminReview toAdmin(Review r) {
        return new AdminReview(r.getId(), r.getCustomerName(), r.getCustomerPhone(), r.getPhotoUrl(), r.getRating(),
                r.getContent(), r.getProject() == null ? null : r.getProject().getId(), r.getProjectName(),
                r.getReviewDate(), r.getStatus(), r.getSource(), r.isFeatured(), r.isVisible(), r.getSortOrder(),
                r.isSample());
    }
}
