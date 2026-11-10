package com.jayashree.repository;

import com.jayashree.entity.Enquiry;
import com.jayashree.entity.Enums.EnquiryStatus;
import com.jayashree.entity.Enums.EnquiryType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EnquiryRepository extends JpaRepository<Enquiry, Long> {

    /** q matches the customer's name (contains) or mobile number (digits, contains). */
    @Query("""
            select e from Enquiry e
            where (:status is null or e.status = :status)
              and (:type is null or e.type = :type)
              and (:q is null or lower(e.fullName) like :q or (:digits is not null and e.mobile like :digits))
            """)
    Page<Enquiry> search(@Param("status") EnquiryStatus status, @Param("type") EnquiryType type,
                         @Param("q") String q, @Param("digits") String digits, Pageable pageable);

    long countByStatus(EnquiryStatus status);

    List<Enquiry> findTop5ByOrderByCreatedAtDesc();
}
