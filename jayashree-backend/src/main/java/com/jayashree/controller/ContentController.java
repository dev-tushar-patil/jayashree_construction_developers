package com.jayashree.controller;

import com.jayashree.dto.CommonDtos.UploadResponse;
import com.jayashree.dto.DashboardDto;
import com.jayashree.dto.DashboardDto.SampleContent;
import com.jayashree.service.ContentService;
import com.jayashree.service.DashboardService;
import com.jayashree.service.ImageService;
import com.jayashree.service.ImageService.StoredImage;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/** Website content (CMS), dashboard, single image uploads and sample-content cleanup. */
@RestController
public class ContentController {

    private final ContentService content;
    private final DashboardService dashboard;
    private final ImageService images;

    public ContentController(ContentService content, DashboardService dashboard, ImageService images) {
        this.content = content;
        this.dashboard = dashboard;
        this.images = images;
    }

    /** All editable text, contact details, social links and SEO fields. Served from memory; edits show at once. */
    @GetMapping("/api/content")
    public ResponseEntity<Map<String, String>> publicContent() {
        return ResponseEntity.ok().cacheControl(CacheControl.noCache()).body(content.all());
    }

    @GetMapping("/api/admin/content")
    public Map<String, String> adminContent() {
        return content.all();
    }

    /** Partial update: send only the keys that changed. */
    @PutMapping("/api/admin/content")
    public Map<String, String> update(@RequestBody Map<String, String> changes) {
        return content.update(changes);
    }

    @GetMapping("/api/admin/dashboard")
    public DashboardDto dashboard() {
        return dashboard.overview();
    }

    @DeleteMapping("/api/admin/sample-content")
    public SampleContent removeSampleContent() {
        return dashboard.removeSampleContent();
    }

    /** One image (service picture, customer photo, page image). Returns its URL to save with the record. */
    @PostMapping(value = "/api/admin/uploads", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UploadResponse upload(@RequestPart("file") MultipartFile file) {
        StoredImage stored = images.storeSingle(file);
        return new UploadResponse(stored.url(), stored.thumbUrl(), stored.width(), stored.height());
    }
}
