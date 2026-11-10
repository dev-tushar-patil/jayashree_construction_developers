package com.jayashree.service;

import com.jayashree.dto.CommonDtos.PageResponse;
import com.jayashree.dto.EnquiryDtos.EnquiryCreated;
import com.jayashree.dto.EnquiryDtos.EnquiryDto;
import com.jayashree.dto.EnquiryDtos.EnquiryRequest;
import com.jayashree.dto.EnquiryDtos.EnquiryUpdateRequest;
import com.jayashree.entity.Enquiry;
import com.jayashree.entity.Enums.EnquiryStatus;
import com.jayashree.entity.Enums.EnquiryType;
import com.jayashree.entity.Project;
import com.jayashree.exception.ApiException;
import com.jayashree.repository.EnquiryRepository;
import com.jayashree.repository.ProjectRepository;
import com.jayashree.util.Text;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Contact, quote and project enquiries from the website, and their follow-up in the admin panel. */
@Service
public class EnquiryService {

    private final EnquiryRepository enquiries;
    private final ProjectRepository projects;

    public EnquiryService(EnquiryRepository enquiries, ProjectRepository projects) {
        this.enquiries = enquiries;
        this.projects = projects;
    }

    @Transactional
    public EnquiryCreated create(EnquiryRequest r) {
        if (Text.clean(r.website()) != null) {
            return new EnquiryCreated(0L); // honeypot filled in: looks successful to the bot, nothing is stored
        }
        if (r.type() == EnquiryType.QUOTE && Text.clean(r.constructionType()) == null) {
            throw ApiException.badRequest("Please choose the construction type.");
        }
        Enquiry e = new Enquiry();
        e.setType(r.type());
        e.setFullName(r.fullName().strip());
        e.setEmail(Text.clean(r.email()));
        e.setMobile(r.mobile().strip());
        e.setInterestedIn(Text.clean(r.interestedIn()));
        e.setProjectLocation(Text.clean(r.projectLocation()));
        e.setConstructionType(Text.clean(r.constructionType()));
        e.setPlotArea(Text.clean(r.plotArea()));
        e.setBudget(Text.clean(r.budget()));
        e.setMessage(Text.clean(r.message()));
        if (r.projectId() != null) {
            projects.findById(r.projectId()).filter(Project::isPublished).ifPresent(p -> {
                e.setProjectId(p.getId());
                e.setProjectName(p.getName());
                if (e.getInterestedIn() == null) {
                    e.setInterestedIn(p.getName());
                }
            });
        }
        e.setStatus(EnquiryStatus.NEW);
        return new EnquiryCreated(enquiries.save(e).getId());
    }

    @Transactional(readOnly = true)
    public PageResponse<EnquiryDto> list(EnquiryStatus status, EnquiryType type, String q, int page, int size) {
        String digits = Text.digits(q);
        PageRequest request = PageRequest.of(Math.max(0, page), Math.max(1, Math.min(size, 100)),
                Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")));
        return PageResponse.of(enquiries.search(status, type, Text.likePattern(q),
                digits.length() >= 3 ? "%" + digits + "%" : null, request), EnquiryService::toDto);
    }

    @Transactional(readOnly = true)
    public EnquiryDto get(Long id) {
        return toDto(find(id));
    }

    @Transactional
    public EnquiryDto update(Long id, EnquiryUpdateRequest request) {
        Enquiry e = find(id);
        e.setStatus(request.status());
        e.setAdminNotes(Text.clean(request.adminNotes()));
        return toDto(e);
    }

    @Transactional
    public void delete(Long id) {
        enquiries.delete(find(id));
    }

    private Enquiry find(Long id) {
        return enquiries.findById(id).orElseThrow(() -> ApiException.notFound("Enquiry"));
    }

    static EnquiryDto toDto(Enquiry e) {
        return new EnquiryDto(e.getId(), e.getType(), e.getFullName(), e.getEmail(), e.getMobile(), e.getInterestedIn(),
                e.getProjectLocation(), e.getConstructionType(), e.getPlotArea(), e.getBudget(), e.getMessage(),
                e.getProjectId(), e.getProjectName(), e.getStatus(), e.getAdminNotes(), e.getCreatedAt(), e.getUpdatedAt());
    }
}
