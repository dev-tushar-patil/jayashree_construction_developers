package com.jayashree.entity;

import com.jayashree.entity.Enums.GalleryCategory;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "gallery_image")
@Getter
@Setter
public class GalleryImage extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GalleryCategory category;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(name = "thumb_url", nullable = false, length = 500)
    private String thumbUrl;

    private Integer width;

    private Integer height;

    @Column(nullable = false)
    private boolean featured;

    @Column(nullable = false)
    private boolean published = true;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(nullable = false)
    private boolean sample;
}
