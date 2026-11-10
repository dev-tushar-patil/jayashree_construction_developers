package com.jayashree.service;

import com.jayashree.dto.CommonDtos.PageResponse;
import com.jayashree.dto.GalleryDtos.GalleryImageDto;
import com.jayashree.dto.GalleryDtos.GalleryUpdateRequest;
import com.jayashree.entity.Enums.GalleryCategory;
import com.jayashree.entity.GalleryImage;
import com.jayashree.exception.ApiException;
import com.jayashree.repository.GalleryImageRepository;
import com.jayashree.service.ImageService.StoredImage;
import com.jayashree.util.Text;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

/** Published gallery photos appear on the public Gallery page as soon as they are saved. */
@Service
public class GalleryService {

    private static final Sort ORDER = Sort.by(Sort.Order.desc("featured"), Sort.Order.asc("sortOrder"),
            Sort.Order.desc("createdAt"), Sort.Order.desc("id"));

    private final GalleryImageRepository gallery;
    private final ImageService images;
    private final ProjectService projectService;

    public GalleryService(GalleryImageRepository gallery, ImageService images, ProjectService projectService) {
        this.gallery = gallery;
        this.images = images;
        this.projectService = projectService;
    }

    @Transactional(readOnly = true)
    public PageResponse<GalleryImageDto> publicList(GalleryCategory category, int page, int size) {
        return PageResponse.of(gallery.search(true, category, null, pageOf(page, size, 60)), GalleryService::toDto);
    }

    @Transactional(readOnly = true)
    public PageResponse<GalleryImageDto> adminList(String q, GalleryCategory category, Boolean published, int page, int size) {
        return PageResponse.of(gallery.search(published, category, Text.likePattern(q), pageOf(page, size, 100)),
                GalleryService::toDto);
    }

    /** Several photos in one go, all with the same category; titles default to the file names. */
    @Transactional
    public List<GalleryImageDto> upload(List<MultipartFile> files, GalleryCategory category, List<String> titles,
                                        String description, boolean published, boolean featured) {
        if (category == null) {
            throw ApiException.badRequest("Please choose a category.");
        }
        List<MultipartFile> uploads = files == null ? List.of() : files.stream().filter(f -> !f.isEmpty()).toList();
        if (uploads.isEmpty()) {
            throw ApiException.badRequest("Please choose at least one image.");
        }
        if (uploads.size() > ProjectService.MAX_FILES_PER_REQUEST) {
            throw ApiException.badRequest("Please upload at most " + ProjectService.MAX_FILES_PER_REQUEST + " images at a time.");
        }
        List<StoredImage> stored = projectService.storeAll(uploads);
        List<GalleryImage> saved = new ArrayList<>();
        try {
            for (int i = 0; i < stored.size(); i++) {
                StoredImage s = stored.get(i);
                String title = titles != null && i < titles.size() ? Text.clean(titles.get(i)) : null;
                GalleryImage image = new GalleryImage();
                image.setTitle(title != null ? truncate(title, 150) : Text.titleFromFilename(uploads.get(i).getOriginalFilename()));
                image.setDescription(truncate(Text.clean(description), 500));
                image.setCategory(category);
                image.setUrl(s.url());
                image.setThumbUrl(s.thumbUrl());
                image.setWidth(s.width());
                image.setHeight(s.height());
                image.setPublished(published);
                image.setFeatured(featured);
                saved.add(image);
            }
            return gallery.saveAllAndFlush(saved).stream().map(GalleryService::toDto).toList();
        } catch (RuntimeException e) {
            stored.forEach(s -> images.delete(s.url(), s.thumbUrl()));
            throw e;
        }
    }

    @Transactional
    public GalleryImageDto update(Long id, GalleryUpdateRequest request) {
        GalleryImage image = find(id);
        image.setTitle(request.title().strip());
        image.setDescription(Text.clean(request.description()));
        image.setCategory(request.category());
        image.setFeatured(request.featured());
        image.setPublished(request.published());
        image.setSortOrder(request.sortOrder());
        return toDto(image);
    }

    @Transactional
    public void delete(Long id) {
        GalleryImage image = find(id);
        gallery.delete(image);
        gallery.flush();
        images.delete(image.getUrl(), image.getThumbUrl());
    }

    private GalleryImage find(Long id) {
        return gallery.findById(id).orElseThrow(() -> ApiException.notFound("Image"));
    }

    private static String truncate(String value, int max) {
        return value == null || value.length() <= max ? value : value.substring(0, max);
    }

    private static PageRequest pageOf(int page, int size, int maxSize) {
        return PageRequest.of(Math.max(0, page), Math.max(1, Math.min(size, maxSize)), ORDER);
    }

    static GalleryImageDto toDto(GalleryImage g) {
        return new GalleryImageDto(g.getId(), g.getTitle(), g.getDescription(), g.getCategory(), g.getUrl(),
                g.getThumbUrl(), g.getWidth(), g.getHeight(), g.isFeatured(), g.isPublished(), g.getSortOrder(),
                g.isSample(), g.getCreatedAt());
    }
}
