package com.jayashree.repository;

import com.jayashree.entity.Enums.ProjectCategory;
import com.jayashree.entity.Enums.ProjectStatus;
import com.jayashree.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/** Every query here excludes soft-deleted projects (see @SQLRestriction on Project). */
public interface ProjectRepository extends JpaRepository<Project, Long> {

    Optional<Project> findBySlug(String slug);

    boolean existsBySlug(String slug);

    @Query("""
            select p from Project p
            where (:published is null or p.published = :published)
              and (:status is null or p.status = :status)
              and (:category is null or p.category = :category)
              and (:q is null or lower(p.name) like :q or lower(p.location) like :q)
            """)
    Page<Project> search(@Param("published") Boolean published, @Param("status") ProjectStatus status,
                         @Param("category") ProjectCategory category, @Param("q") String q, Pageable pageable);

    List<Project> findByPublishedTrueAndFeaturedTrue(Pageable pageable);

    List<Project> findByPublishedTrue(Pageable pageable);

    List<Project> findBySampleTrue();

    long countByStatus(ProjectStatus status);

    long countByPublishedTrue();

    @Query("select p.id as id, p.name as name from Project p order by p.name")
    List<ProjectOption> listOptions();

    interface ProjectOption {
        Long getId();

        String getName();
    }

    /** Soft-deleted rows are invisible to JPQL, so slug uniqueness across them is checked natively. */
    @Query(value = "select count(*) from project where slug = :slug", nativeQuery = true)
    long countAnyWithSlug(@Param("slug") String slug);

    @Modifying
    @Query(value = "update project set deleted_at = CURRENT_TIMESTAMP(6), published = false, featured = false, "
            + "slug = concat(slug, '--deleted-', id) where id = :id", nativeQuery = true)
    int softDelete(@Param("id") Long id);
}
