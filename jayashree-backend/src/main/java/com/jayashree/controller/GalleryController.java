package com.jayashree.controller;

import com.jayashree.dto.CommonDtos.PageResponse;
import com.jayashree.dto.GalleryDtos.GalleryImageDto;
import com.jayashree.dto.GalleryDtos.GalleryUpdateRequest;
import com.jayashree.entity.Enums.GalleryCategory;
import com.jayashree.service.GalleryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
public class GalleryController {

    private final GalleryService gallery;

    public GalleryController(GalleryService gallery) {
        this.gallery = gallery;
    }

    @GetMapping("/api/gallery")
    public PageResponse<GalleryImageDto> list(@RequestParam(required = false) GalleryCategory category,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "24") int size) {
        return gallery.publicList(category, page, size);
    }

    @GetMapping("/api/admin/gallery")
    public PageResponse<GalleryImageDto> adminList(@RequestParam(required = false) String q,
                                                   @RequestParam(required = false) GalleryCategory category,
                                                   @RequestParam(required = false) Boolean published,
                                                   @RequestParam(defaultValue = "0") int page,
                                                   @RequestParam(defaultValue = "24") int size) {
        return gallery.adminList(q, category, published, page, size);
    }

    /** Multipart: files (1-10), category, optional titles (one per file), description, published, featured. */
    @PostMapping(value = "/api/admin/gallery", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<GalleryImageDto>> upload(@RequestPart("files") List<MultipartFile> files,
                                                        @RequestParam GalleryCategory category,
                                                        @RequestParam(required = false) List<String> titles,
                                                        @RequestParam(required = false) String description,
                                                        @RequestParam(defaultValue = "true") boolean published,
                                                        @RequestParam(defaultValue = "false") boolean featured) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(gallery.upload(files, category, titles, description, published, featured));
    }

    @PutMapping("/api/admin/gallery/{id}")
    public GalleryImageDto update(@PathVariable Long id, @Valid @RequestBody GalleryUpdateRequest request) {
        return gallery.update(id, request);
    }

    @DeleteMapping("/api/admin/gallery/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        gallery.delete(id);
        return ResponseEntity.noContent().build();
    }
}
