package com.jayashree.repository;

import com.jayashree.entity.ProjectImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProjectImageRepository extends JpaRepository<ProjectImage, Long> {

    Optional<ProjectImage> findByIdAndProjectId(Long id, Long projectId);
}
