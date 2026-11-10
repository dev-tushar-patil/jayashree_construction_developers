package com.jayashree.repository;

import com.jayashree.entity.ServiceOffering;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ServiceOfferingRepository extends JpaRepository<ServiceOffering, Long> {

    List<ServiceOffering> findByPublishedTrueOrderBySortOrderAscIdAsc();

    List<ServiceOffering> findAllByOrderBySortOrderAscIdAsc();

    Optional<ServiceOffering> findBySlugAndPublishedTrue(String slug);

    boolean existsBySlug(String slug);
}
