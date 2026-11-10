package com.jayashree.service;

import com.jayashree.dto.CommonDtos.PageResponse;
import com.jayashree.dto.ProjectDtos.ProjectDetail;
import com.jayashree.dto.ProjectDtos.ProjectImageDto;
import com.jayashree.dto.ProjectDtos.ProjectRequest;
import com.jayashree.dto.ProjectDtos.ProjectSummary;
import com.jayashree.entity.Enums.ProjectCategory;
import com.jayashree.entity.Enums.ProjectStatus;
import com.jayashree.entity.Project;
import com.jayashree.entity.ProjectImage;
import com.jayashree.exception.ApiException;
import com.jayashree.repository.ProjectRepository;
import com.jayashree.repository.ReviewRepository;
import com.jayashree.service.ImageService.StoredImage;
import com.jayashree.util.Text;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Projects drive the public Projects page and the homepage. Anything saved here with published=true appears
 * there straight away: the frontend only ever renders what these methods return.
 */
@Service
public class ProjectService {

    public static final int MAX_FILES_PER_REQUEST = 10;
    private static final Sort NEWEST = Sort.by(Sort.Order.asc("sortOrder"), Sort.Order.desc("createdAt"), Sort.Order.desc("id"));

    private final ProjectRepository projects;
    private final ReviewRepository reviews;
    private final ImageService images;

    public ProjectService(ProjectRepository projects, ReviewRepository reviews, ImageService images) {
        this.projects = projects;
        this.reviews = reviews;
        this.images = images;
    }

    // ---------------------------------------------------------------- public

    @Transactional(readOnly = true)
    public PageResponse<ProjectSummary> publicList(ProjectCategory category, ProjectStatus status, int page, int size) {
        return PageResponse.of(projects.search(true, status, category, null, pageOf(page, size, 24)),
                ProjectService::toSummary);
    }

    /** Featured projects first, then the newest published ones, so new projects show up even when unfeatured. */
    @Transactional(readOnly = true)
    public List<ProjectSummary> homepage(int limit) {
        int n = Math.max(1, Math.min(limit, 12));
        Map<Long, Project> picked = new LinkedHashMap<>();
        projects.findByPublishedTrueAndFeaturedTrue(PageRequest.of(0, n, NEWEST)).forEach(p -> picked.put(p.getId(), p));
        if (picked.size() < n) {
            projects.findByPublishedTrue(PageRequest.of(0, n, Sort.by(Sort.Order.desc("createdAt"))))
                    .forEach(p -> { if (picked.size() < n) picked.putIfAbsent(p.getId(), p); });
        }
        return picked.values().stream().map(ProjectService::toSummary).toList();
    }

    @Transactional(readOnly = true)
    public ProjectDetail publicDetail(String slug) {
        return projects.findBySlug(slug).filter(Project::isPublished).map(ProjectService::toDetail)
                .orElseThrow(() -> ApiException.notFound("Project"));
    }

    // ---------------------------------------------------------------- admin

    @Transactional(readOnly = true)
    public PageResponse<ProjectSummary> adminList(String q, ProjectStatus status, ProjectCategory category,
                                                  Boolean published, int page, int size) {
        return PageResponse.of(projects.search(published, status, category, Text.likePattern(q),
                pageOf(page, size, 100)), ProjectService::toSummary);
    }

    @Transactional(readOnly = true)
    public ProjectDetail adminGet(Long id) {
        return toDetail(find(id));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> options() {
        return projects.listOptions().stream()
                .map(o -> Map.<String, Object>of("id", o.getId(), "name", o.getName())).toList();
    }

    @Transactional
    public ProjectDetail create(ProjectRequest request) {
        validateDates(request);
        Project project = new Project();
        apply(project, request);
        project.setSlug(Text.uniqueSlug(Text.slugify(request.name()), s -> projects.countAnyWithSlug(s) > 0));
        return toDetail(projects.save(project));
    }

    @Transactional
    public ProjectDetail update(Long id, ProjectRequest request) {
        validateDates(request);
        Project project = find(id);
        boolean renamed = !project.getName().equals(request.name().strip());
        apply(project, request);
        if (renamed) {
            String base = Text.slugify(request.name());
            if (!project.getSlug().equals(base)) {
                project.setSlug(Text.uniqueSlug(base, s -> !s.equals(project.getSlug()) && projects.countAnyWithSlug(s) > 0));
            }
        }
        return toDetail(project);
    }

    @Transactional
    public ProjectSummary setFlags(Long id, Boolean published, Boolean featured) {
        Project project = find(id);
        if (published != null) {
            project.setPublished(published);
        }
        if (featured != null) {
            project.setFeatured(featured);
        }
        return toSummary(project);
    }

    /** Soft delete: the row stays for records but disappears everywhere; its slug is freed for reuse. */
    @Transactional
    public void delete(Long id) {
        find(id);
        reviews.detachProject(id);
        projects.softDelete(id);
    }

    @Transactional
    public ProjectDetail addImages(Long id, List<MultipartFile> files) {
        Project project = find(id);
        List<MultipartFile> uploads = files == null ? List.of() : files.stream().filter(f -> !f.isEmpty()).toList();
        if (uploads.isEmpty()) {
            throw ApiException.badRequest("Please choose at least one image.");
        }
        if (uploads.size() > MAX_FILES_PER_REQUEST) {
            throw ApiException.badRequest("Please upload at most " + MAX_FILES_PER_REQUEST + " images at a time.");
        }
        List<StoredImage> stored = storeAll(uploads);
        int next = project.getImages().stream().mapToInt(ProjectImage::getSortOrder).max().orElse(-1) + 1;
        boolean hasCover = project.getImages().stream().anyMatch(ProjectImage::isCover);
        for (StoredImage s : stored) {
            ProjectImage image = new ProjectImage();
            image.setProject(project);
            image.setUrl(s.url());
            image.setThumbUrl(s.thumbUrl());
            image.setWidth(s.width());
            image.setHeight(s.height());
            image.setSortOrder(next++);
            if (!hasCover) {
                image.setCover(true);
                hasCover = true;
            }
            project.getImages().add(image);
        }
        try {
            projects.saveAndFlush(project);
        } catch (RuntimeException e) {
            stored.forEach(s -> images.delete(s.url(), s.thumbUrl()));
            throw e;
        }
        return toDetail(project);
    }

    @Transactional
    public ProjectDetail deleteImage(Long projectId, Long imageId) {
        Project project = find(projectId);
        ProjectImage image = findImage(project, imageId);
        project.getImages().remove(image);
        if (image.isCover() && !project.getImages().isEmpty()) {
            project.getImages().get(0).setCover(true);
        }
        projects.saveAndFlush(project);
        images.delete(image.getUrl(), image.getThumbUrl());
        return toDetail(project);
    }

    @Transactional
    public ProjectDetail setCover(Long projectId, Long imageId) {
        Project project = find(projectId);
        ProjectImage chosen = findImage(project, imageId);
        project.getImages().forEach(i -> i.setCover(i == chosen));
        return toDetail(project);
    }

    @Transactional
    public ProjectDetail updateCaption(Long projectId, Long imageId, String caption) {
        Project project = find(projectId);
        findImage(project, imageId).setCaption(Text.clean(caption));
        return toDetail(project);
    }

    @Transactional
    public ProjectDetail reorderImages(Long projectId, List<Long> ids) {
        Project project = find(projectId);
        Map<Long, ProjectImage> byId = project.getImages().stream()
                .collect(Collectors.toMap(ProjectImage::getId, Function.identity()));
        int order = 0;
        for (Long imageId : ids == null ? List.<Long>of() : ids) {
            ProjectImage image = byId.remove(imageId);
            if (image != null) {
                image.setSortOrder(order++);
            }
        }
        for (ProjectImage rest : byId.values()) {
            rest.setSortOrder(order++);
        }
        projects.saveAndFlush(project);
        project.getImages().sort((a, b) -> Integer.compare(a.getSortOrder(), b.getSortOrder()));
        return toDetail(project);
    }

    // ---------------------------------------------------------------- helpers

    /** Stores every file or none: if one is rejected, the ones already written are removed again. */
    List<StoredImage> storeAll(List<MultipartFile> files) {
        List<StoredImage> stored = new ArrayList<>();
        try {
            for (MultipartFile file : files) {
                stored.add(images.store(file));
            }
        } catch (RuntimeException e) {
            stored.forEach(s -> images.delete(s.url(), s.thumbUrl()));
            throw e;
        }
        return stored;
    }

    private Project find(Long id) {
        return projects.findById(id).orElseThrow(() -> ApiException.notFound("Project"));
    }

    private static ProjectImage findImage(Project project, Long imageId) {
        return project.getImages().stream().filter(i -> i.getId().equals(imageId)).findFirst()
                .orElseThrow(() -> ApiException.notFound("Image"));
    }

    private static void validateDates(ProjectRequest r) {
        if (r.startDate() != null && r.completionDate() != null && r.completionDate().isBefore(r.startDate())) {
            throw ApiException.badRequest("The completion date cannot be before the start date.");
        }
    }

    private static void apply(Project p, ProjectRequest r) {
        p.setName(r.name().strip());
        p.setCategory(r.category());
        p.setShortDescription(r.shortDescription().strip());
        p.setDescription(Text.clean(r.description()));
        p.setLocation(r.location().strip());
        p.setMapsUrl(Text.clean(r.mapsUrl()));
        p.setStatus(r.status());
        p.setStartDate(r.startDate());
        p.setCompletionDate(r.completionDate());
        p.setFeatures(new ArrayList<>(Text.cleanList(r.features())));
        p.setFeatured(r.featured());
        p.setPublished(r.published());
    }

    private static PageRequest pageOf(int page, int size, int maxSize) {
        return PageRequest.of(Math.max(0, page), Math.max(1, Math.min(size, maxSize)), NEWEST);
    }

    public static ProjectSummary toSummary(Project p) {
        ProjectImage cover = p.coverImage();
        return new ProjectSummary(p.getId(), p.getSlug(), p.getName(), p.getCategory(), p.getShortDescription(),
                p.getLocation(), p.getStatus(), cover == null ? null : cover.getUrl(),
                cover == null ? null : cover.getThumbUrl(), p.getImages().size(), p.isFeatured(), p.isPublished(),
                p.isSample(), p.getCreatedAt());
    }

    static ProjectDetail toDetail(Project p) {
        List<ProjectImageDto> imageDtos = p.getImages().stream()
                .map(i -> new ProjectImageDto(i.getId(), i.getUrl(), i.getThumbUrl(), i.getCaption(), i.getWidth(),
                        i.getHeight(), i.isCover(), i.getSortOrder()))
                .toList();
        return new ProjectDetail(p.getId(), p.getSlug(), p.getName(), p.getCategory(), p.getShortDescription(),
                p.getDescription(), p.getLocation(), p.getMapsUrl(), p.getStatus(), p.getStartDate(),
                p.getCompletionDate(), List.copyOf(p.getFeatures()), p.isFeatured(), p.isPublished(), p.isSample(),
                imageDtos, p.getCreatedAt(), p.getUpdatedAt());
    }
}
