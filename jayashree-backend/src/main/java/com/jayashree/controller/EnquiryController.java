package com.jayashree.controller;

import com.jayashree.dto.CommonDtos.PageResponse;
import com.jayashree.dto.EnquiryDtos.EnquiryCreated;
import com.jayashree.dto.EnquiryDtos.EnquiryDto;
import com.jayashree.dto.EnquiryDtos.EnquiryRequest;
import com.jayashree.dto.EnquiryDtos.EnquiryUpdateRequest;
import com.jayashree.entity.Enums.EnquiryStatus;
import com.jayashree.entity.Enums.EnquiryType;
import com.jayashree.service.EnquiryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EnquiryController {

    private final EnquiryService enquiries;

    public EnquiryController(EnquiryService enquiries) {
        this.enquiries = enquiries;
    }

    @PostMapping("/api/enquiries")
    public ResponseEntity<EnquiryCreated> create(@Valid @RequestBody EnquiryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(enquiries.create(request));
    }

    /** q searches the customer's name or mobile number. */
    @GetMapping("/api/admin/enquiries")
    public PageResponse<EnquiryDto> list(@RequestParam(required = false) EnquiryStatus status,
                                         @RequestParam(required = false) EnquiryType type,
                                         @RequestParam(required = false) String q,
                                         @RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "20") int size) {
        return enquiries.list(status, type, q, page, size);
    }

    @GetMapping("/api/admin/enquiries/{id}")
    public EnquiryDto get(@PathVariable Long id) {
        return enquiries.get(id);
    }

    @PutMapping("/api/admin/enquiries/{id}")
    public EnquiryDto update(@PathVariable Long id, @Valid @RequestBody EnquiryUpdateRequest request) {
        return enquiries.update(id, request);
    }

    @DeleteMapping("/api/admin/enquiries/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        enquiries.delete(id);
        return ResponseEntity.noContent().build();
    }
}
