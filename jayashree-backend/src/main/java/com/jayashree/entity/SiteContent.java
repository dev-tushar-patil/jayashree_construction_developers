package com.jayashree.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

/** One editable piece of website content: text, contact detail, social link or SEO field. */
@Entity
@Table(name = "site_content")
@Getter
@Setter
@NoArgsConstructor
public class SiteContent {

    @Id
    @Column(name = "content_key", length = 100)
    private String key;

    @Column(nullable = false, length = 30)
    private String section;

    @Column(name = "content_value", columnDefinition = "TEXT")
    private String value;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public SiteContent(String key, String section, String value) {
        this.key = key;
        this.section = section;
        this.value = value;
    }
}
