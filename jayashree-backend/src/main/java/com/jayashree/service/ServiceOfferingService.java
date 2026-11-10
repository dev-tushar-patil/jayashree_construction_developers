package com.jayashree.service;

import com.jayashree.dto.ServiceDtos.ServiceDto;
import com.jayashree.dto.ServiceDtos.ServiceRequest;
import com.jayashree.entity.ServiceOffering;
import com.jayashree.exception.ApiException;
import com.jayashree.repository.ServiceOfferingRepository;
import com.jayashree.service.storage.StorageService;
import com.jayashree.util.Text;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ServiceOfferingService {

    private final ServiceOfferingRepository services;
    private final StorageService storage;

    public ServiceOfferingService(ServiceOfferingRepository services, StorageService storage) {
        this.services = services;
        this.storage = storage;
    }

    @Transactional(readOnly = true)
    public List<ServiceDto> publicList() {
        return services.findByPublishedTrueOrderBySortOrderAscIdAsc().stream().map(ServiceOfferingService::toDto).toList();
    }

    @Transactional(readOnly = true)
    public ServiceDto publicGet(String slug) {
        return services.findBySlugAndPublishedTrue(slug).map(ServiceOfferingService::toDto)
                .orElseThrow(() -> ApiException.notFound("Service"));
    }

    @Transactional(readOnly = true)
    public List<ServiceDto> adminList() {
        return services.findAllByOrderBySortOrderAscIdAsc().stream().map(ServiceOfferingService::toDto).toList();
    }

    @Transactional
    public ServiceDto create(ServiceRequest request) {
        ServiceOffering service = new ServiceOffering();
        apply(service, request);
        service.setSlug(Text.uniqueSlug(Text.slugify(request.title()), services::existsBySlug));
        service.setSortOrder(services.findAllByOrderBySortOrderAscIdAsc().stream()
                .mapToInt(ServiceOffering::getSortOrder).max().orElse(-1) + 1);
        return toDto(services.save(service));
    }

    @Transactional
    public ServiceDto update(Long id, ServiceRequest request) {
        ServiceOffering service = find(id);
        String oldImage = service.getImageUrl();
        boolean renamed = !service.getTitle().equals(request.title().strip());
        apply(service, request);
        if (renamed) {
            String base = Text.slugify(request.title());
            if (!service.getSlug().equals(base)) {
                service.setSlug(Text.uniqueSlug(base, s -> !s.equals(service.getSlug()) && services.existsBySlug(s)));
            }
        }
        services.flush();
        if (oldImage != null && !oldImage.equals(service.getImageUrl())) {
            storage.delete(oldImage);
        }
        return toDto(service);
    }

    @Transactional
    public void delete(Long id) {
        ServiceOffering service = find(id);
        services.delete(service);
        services.flush();
        storage.delete(service.getImageUrl());
    }

    /** Saves the order shown in the admin list; ids not mentioned keep their relative order after these. */
    @Transactional
    public List<ServiceDto> reorder(List<Long> ids) {
        List<ServiceOffering> all = services.findAllByOrderBySortOrderAscIdAsc();
        Map<Long, ServiceOffering> byId = all.stream().collect(Collectors.toMap(ServiceOffering::getId, Function.identity()));
        int order = 0;
        List<ServiceOffering> ordered = new ArrayList<>();
        for (Long id : ids == null ? List.<Long>of() : ids) {
            ServiceOffering s = byId.remove(id);
            if (s != null) {
                ordered.add(s);
            }
        }
        all.stream().filter(s -> byId.containsKey(s.getId())).forEach(ordered::add);
        for (ServiceOffering s : ordered) {
            s.setSortOrder(order++);
        }
        return ordered.stream().map(ServiceOfferingService::toDto).toList();
    }

    private ServiceOffering find(Long id) {
        return services.findById(id).orElseThrow(() -> ApiException.notFound("Service"));
    }

    private static void apply(ServiceOffering s, ServiceRequest r) {
        s.setTitle(r.title().strip());
        s.setShortDescription(r.shortDescription().strip());
        s.setDescription(Text.clean(r.description()));
        s.setIcon(r.icon());
        s.setImageUrl(Text.clean(r.imageUrl()));
        s.setFeatures(new ArrayList<>(Text.cleanList(r.features())));
        s.setPublished(r.published());
    }

    static ServiceDto toDto(ServiceOffering s) {
        return new ServiceDto(s.getId(), s.getSlug(), s.getTitle(), s.getShortDescription(), s.getDescription(),
                s.getIcon(), s.getImageUrl(), List.copyOf(s.getFeatures()), s.getSortOrder(), s.isPublished());
    }
}
