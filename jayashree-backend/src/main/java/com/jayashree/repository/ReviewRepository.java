package com.jayashree.repository;

import com.jayashree.entity.Enums.ReviewStatus;
import com.jayashree.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    /** What the public may see: approved and visible. */
    Page<Review> findByStatusAndVisibleTrue(ReviewStatus status, Pageable pageable);

    List<Review> findByStatusAndVisibleTrueAndFeaturedTrueOrderBySortOrderAscReviewDateDesc(ReviewStatus status);

    List<Review> findByFeaturedTrueOrderBySortOrderAscReviewDateDesc();

    @Query("""
            select r from Review r
            where (:status is null or r.status = :status)
              and (:q is null or lower(r.customerName) like :q or lower(r.content) like :q)
            """)
    Page<Review> search(@Param("status") ReviewStatus status, @Param("q") String q, Pageable pageable);

    List<Review> findBySampleTrue();

    long countByStatus(ReviewStatus status);

    @Query("select coalesce(avg(r.rating), 0) from Review r where r.status = :status and r.visible = true")
    double averageRating(@Param("status") ReviewStatus status);

    @Modifying
    @Query("update Review r set r.project = null where r.project.id = :projectId")
    int detachProject(@Param("projectId") Long projectId);
}
