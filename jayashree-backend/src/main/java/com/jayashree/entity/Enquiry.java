package com.jayashree.entity;

import com.jayashree.entity.Enums.EnquiryStatus;
import com.jayashree.entity.Enums.EnquiryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/** Contact form, quote request or project enquiry. project_id is a plain reference, kept even if the project goes. */
@Entity
@Table(name = "enquiry")
@Getter
@Setter
public class Enquiry extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EnquiryType type;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(length = 160)
    private String email;

    @Column(nullable = false, length = 20)
    private String mobile;

    @Column(name = "interested_in", length = 120)
    private String interestedIn;

    @Column(name = "project_location", length = 150)
    private String projectLocation;

    @Column(name = "construction_type", length = 60)
    private String constructionType;

    @Column(name = "plot_area", length = 60)
    private String plotArea;

    @Column(length = 60)
    private String budget;

    @Column(length = 3000)
    private String message;

    @Column(name = "project_id")
    private Long projectId;

    @Column(name = "project_name", length = 150)
    private String projectName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EnquiryStatus status = EnquiryStatus.NEW;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;
}
