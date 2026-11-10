package com.jayashree.controller;

import com.jayashree.dto.CommonDtos.IdOrder;
import com.jayashree.dto.ServiceDtos.ServiceDto;
import com.jayashree.dto.ServiceDtos.ServiceRequest;
import com.jayashree.service.ServiceOfferingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ServiceController {

    private final ServiceOfferingService services;

    public ServiceController(ServiceOfferingService services) {
        this.services = services;
    }

    @GetMapping("/api/services")
    public List<ServiceDto> list() {
        return services.publicList();
    }

    @GetMapping("/api/services/{slug}")
    public ServiceDto detail(@PathVariable String slug) {
        return services.publicGet(slug);
    }

    @GetMapping("/api/admin/services")
    public List<ServiceDto> adminList() {
        return services.adminList();
    }

    @PostMapping("/api/admin/services")
    public ResponseEntity<ServiceDto> create(@Valid @RequestBody ServiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(services.create(request));
    }

    @PutMapping("/api/admin/services/order")
    public List<ServiceDto> reorder(@RequestBody IdOrder order) {
        return services.reorder(order.ids());
    }

    @PutMapping("/api/admin/services/{id}")
    public ServiceDto update(@PathVariable Long id, @Valid @RequestBody ServiceRequest request) {
        return services.update(id, request);
    }

    @DeleteMapping("/api/admin/services/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        services.delete(id);
        return ResponseEntity.noContent().build();
    }
}
