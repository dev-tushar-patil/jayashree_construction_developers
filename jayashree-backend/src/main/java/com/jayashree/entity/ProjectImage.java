package com.jayashree.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "project_image")
@Getter
@Setter
public class ProjectImage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(name = "thumb_url", nullable = false, length = 500)
    private String thumbUrl;

    @Column(length = 200)
    private String caption;

    private Integer width;

    private Integer height;

    @Column(nullable = false)
    private boolean cover;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;
}
