package com.jayashree.repository;

import com.jayashree.entity.Enums.GalleryCategory;
import com.jayashree.entity.GalleryImage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GalleryImageRepository extends JpaRepository<GalleryImage, Long> {

    @Query("""
            select g from GalleryImage g
            where (:published is null or g.published = :published)
              and (:category is null or g.category = :category)
              and (:q is null or lower(g.title) like :q or lower(g.description) like :q)
            """)
    Page<GalleryImage> search(@Param("published") Boolean published, @Param("category") GalleryCategory category,
                              @Param("q") String q, Pageable pageable);

    List<GalleryImage> findBySampleTrue();

    long countByPublishedTrue();
}
