package com.jayashree.entity;

import com.jayashree.entity.Enums.ProjectCategory;
import com.jayashree.entity.Enums.ProjectStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/** Soft-deleted projects (deleted_at set) are invisible to every query through this entity. */
@Entity
@Table(name = "project")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
public class Project extends BaseEntity {

    @Column(nullable = false, length = 180)
    private String slug;

    @Column(nullable = false, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProjectCategory category;

    @Column(name = "short_description", nullable = false, length = 300)
    private String shortDescription;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 150)
    private String location;

    @Column(name = "maps_url", length = 1000)
    private String mapsUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProjectStatus status;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "completion_date")
    private LocalDate completionDate;

    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<String> features = new ArrayList<>();

    @Column(nullable = false)
    private boolean featured;

    @Column(nullable = false)
    private boolean published;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(nullable = false)
    private boolean sample;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, id ASC")
    private List<ProjectImage> images = new ArrayList<>();

    /** The image marked as cover, else the first one. */
    public ProjectImage coverImage() {
        return images.stream().filter(ProjectImage::isCover).findFirst()
                .orElse(images.stream().min(Comparator.comparingInt(ProjectImage::getSortOrder)).orElse(null));
    }
}
