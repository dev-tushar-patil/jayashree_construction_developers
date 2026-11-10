package com.jayashree.controller;

import com.jayashree.dto.CommonDtos.IdOrder;
import com.jayashree.dto.CommonDtos.PageResponse;
import com.jayashree.dto.ReviewDtos.AdminReview;
import com.jayashree.dto.ReviewDtos.ModerationRequest;
import com.jayashree.dto.ReviewDtos.PublicReview;
import com.jayashree.dto.ReviewDtos.ReviewRequest;
import com.jayashree.dto.ReviewDtos.ReviewSubmission;
import com.jayashree.entity.Enums.ReviewStatus;
import com.jayashree.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class ReviewController {

    private final ReviewService reviews;

    public ReviewController(ReviewService reviews) {
        this.reviews = reviews;
    }

    // ---------------------------------------------------------------- public (approved + visible only)

    @GetMapping("/api/reviews")
    public PageResponse<PublicReview> list(@RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "12") int size) {
        return reviews.publicList(page, size);
    }

    @GetMapping("/api/reviews/featured")
    public List<PublicReview> testimonials() {
        return reviews.testimonials();
    }

    @GetMapping("/api/reviews/summary")
    public Map<String, Object> summary() {
        return reviews.summary();
    }

    /** Visitors' reviews wait for approval. */
    @PostMapping("/api/reviews")
    public ResponseEntity<Map<String, String>> submit(@Valid @RequestBody ReviewSubmission submission) {
        reviews.submit(submission);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(Map.of("message", "Thank you! Your review will appear once it has been approved."));
    }

    // ---------------------------------------------------------------- admin

    @GetMapping("/api/admin/reviews")
    public PageResponse<AdminReview> adminList(@RequestParam(required = false) ReviewStatus status,
                                               @RequestParam(required = false) String q,
                                               @RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "20") int size) {
        return reviews.adminList(status, q, page, size);
    }

    @PostMapping("/api/admin/reviews")
    public ResponseEntity<AdminReview> create(@Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviews.create(request));
    }

    @PutMapping("/api/admin/reviews/{id}")
    public AdminReview update(@PathVariable Long id, @Valid @RequestBody ReviewRequest request) {
        return reviews.update(id, request);
    }

    /** Approve / reject / feature / hide without resending the whole review. */
    @PatchMapping("/api/admin/reviews/{id}")
    public AdminReview moderate(@PathVariable Long id, @RequestBody ModerationRequest request) {
        return reviews.moderate(id, request);
    }

    @DeleteMapping("/api/admin/reviews/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reviews.delete(id);
        return ResponseEntity.noContent().build();
    }

    /** Testimonials are the featured reviews, in slider order. */
    @GetMapping("/api/admin/testimonials")
    public List<AdminReview> testimonialsAdmin() {
        return reviews.adminTestimonials();
    }

    @PutMapping("/api/admin/testimonials/order")
    public List<AdminReview> reorderTestimonials(@RequestBody IdOrder order) {
        return reviews.reorderTestimonials(order.ids());
    }
}
