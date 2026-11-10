package com.jayashree.dto;

import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

public final class CommonDtos {

    private CommonDtos() {}

    /** A stable page shape for the frontend, rather than Spring's internal Page serialisation. */
    public record PageResponse<T>(List<T> content, int page, int size, long totalElements, int totalPages) {
        public static <E, T> PageResponse<T> of(Page<E> page, Function<E, T> mapper) {
            return new PageResponse<>(page.getContent().stream().map(mapper).toList(), page.getNumber(),
                    page.getSize(), page.getTotalElements(), page.getTotalPages());
        }
    }

    public record UploadResponse(String url, String thumbUrl, Integer width, Integer height) {}

    public record IdOrder(List<Long> ids) {}
}
