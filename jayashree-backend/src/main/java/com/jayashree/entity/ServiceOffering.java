package com.jayashree.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/** A service the company offers (named so it does not clash with Spring's @Service). */
@Entity
@Table(name = "service_offering")
@Getter
@Setter
public class ServiceOffering extends BaseEntity {

    @Column(nullable = false, length = 160)
    private String slug;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(name = "short_description", nullable = false, length = 300)
    private String shortDescription;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 40)
    private String icon = "home";

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<String> features = new ArrayList<>();

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(nullable = false)
    private boolean published = true;
}
