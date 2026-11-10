package com.jayashree.entity;

import com.jayashree.entity.Enums.ReviewSource;
import com.jayashree.entity.Enums.ReviewStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;

import java.time.LocalDate;

/**
 * A customer review. Featured, approved reviews double as the homepage testimonials, so there is one
 * table rather than two copies of the same words.
 */
@Entity
@Table(name = "review")
@Getter
@Setter
public class Review extends BaseEntity {

    @Column(name = "customer_name", nullable = false, length = 120)
    private String customerName;

    @Column(name = "customer_phone", length = 20)
    private String customerPhone;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @Column(nullable = false)
    private int rating;

    @Column(nullable = false, length = 2000)
    private String content;

    /** Optional. A soft-deleted project reads as no project. */
    @ManyToOne(fetch = FetchType.EAGER) // eager: required by @NotFound below
    @JoinColumn(name = "project_id")
    @NotFound(action = NotFoundAction.IGNORE)
    private Project project;

    @Column(name = "project_name", length = 150)
    private String projectName;

    @Column(name = "review_date", nullable = false)
    private LocalDate reviewDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReviewStatus status = ReviewStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReviewSource source = ReviewSource.ADMIN;

    @Column(nullable = false)
    private boolean featured;

    @Column(nullable = false)
    private boolean visible = true;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(nullable = false)
    private boolean sample;
}
