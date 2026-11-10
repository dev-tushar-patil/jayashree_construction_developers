package com.jayashree.controller;

import com.jayashree.dto.CommonDtos.IdOrder;
import com.jayashree.dto.CommonDtos.PageResponse;
import com.jayashree.dto.ProjectDtos.ImageUpdateRequest;
import com.jayashree.dto.ProjectDtos.ProjectDetail;
import com.jayashree.dto.ProjectDtos.ProjectRequest;
import com.jayashree.dto.ProjectDtos.ProjectSummary;
import com.jayashree.entity.Enums.ProjectCategory;
import com.jayashree.entity.Enums.ProjectStatus;
import com.jayashree.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
public class ProjectController {

    private final ProjectService projects;

    public ProjectController(ProjectService projects) {
        this.projects = projects;
    }

    // ---------------------------------------------------------------- public (published only)

    @GetMapping("/api/projects")
    public PageResponse<ProjectSummary> list(@RequestParam(required = false) ProjectCategory category,
                                             @RequestParam(required = false) ProjectStatus status,
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "12") int size) {
        return projects.publicList(category, status, page, size);
    }

    @GetMapping("/api/projects/featured")
    public List<ProjectSummary> featured(@RequestParam(defaultValue = "6") int limit) {
        return projects.homepage(limit);
    }

    @GetMapping("/api/projects/{slug}")
    public ProjectDetail detail(@PathVariable String slug) {
        return projects.publicDetail(slug);
    }

    // ---------------------------------------------------------------- admin

    @GetMapping("/api/admin/projects")
    public PageResponse<ProjectSummary> adminList(@RequestParam(required = false) String q,
                                                  @RequestParam(required = false) ProjectStatus status,
                                                  @RequestParam(required = false) ProjectCategory category,
                                                  @RequestParam(required = false) Boolean published,
                                                  @RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "20") int size) {
        return projects.adminList(q, status, category, published, page, size);
    }

    @GetMapping("/api/admin/projects/options")
    public List<Map<String, Object>> options() {
        return projects.options();
    }

    @GetMapping("/api/admin/projects/{id}")
    public ProjectDetail adminGet(@PathVariable Long id) {
        return projects.adminGet(id);
    }

    @PostMapping("/api/admin/projects")
    public ResponseEntity<ProjectDetail> create(@Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projects.create(request));
    }

    @PutMapping("/api/admin/projects/{id}")
    public ProjectDetail update(@PathVariable Long id, @Valid @RequestBody ProjectRequest request) {
        return projects.update(id, request);
    }

    /** Quick publish/unpublish and feature toggles from the list. */
    @PatchMapping("/api/admin/projects/{id}")
    public ProjectSummary setFlags(@PathVariable Long id, @RequestBody Map<String, Boolean> flags) {
        return projects.setFlags(id, flags.get("published"), flags.get("featured"));
    }

    @DeleteMapping("/api/admin/projects/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        projects.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/api/admin/projects/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProjectDetail addImages(@PathVariable Long id, @RequestPart("files") List<MultipartFile> files) {
        return projects.addImages(id, files);
    }

    @DeleteMapping("/api/admin/projects/{id}/images/{imageId}")
    public ProjectDetail deleteImage(@PathVariable Long id, @PathVariable Long imageId) {
        return projects.deleteImage(id, imageId);
    }

    @PutMapping("/api/admin/projects/{id}/images/{imageId}/cover")
    public ProjectDetail setCover(@PathVariable Long id, @PathVariable Long imageId) {
        return projects.setCover(id, imageId);
    }

    @PutMapping("/api/admin/projects/{id}/images/{imageId}")
    public ProjectDetail updateImage(@PathVariable Long id, @PathVariable Long imageId,
                                     @Valid @RequestBody ImageUpdateRequest request) {
        return projects.updateCaption(id, imageId, request.caption());
    }

    @PutMapping("/api/admin/projects/{id}/images/order")
    public ProjectDetail reorderImages(@PathVariable Long id, @RequestBody IdOrder order) {
        return projects.reorderImages(id, order.ids());
    }
}
