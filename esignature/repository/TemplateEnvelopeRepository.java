package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.TemplateEnvelope;
import com.skapp.enterprise.esignature.payload.request.template.EnvelopeTemplateSearchDto;
import com.skapp.enterprise.esignature.payload.request.template.TemplateEnvelopeFilterDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TemplateEnvelopeRepository {

	Page<TemplateEnvelope> findAllTemplateEnvelopesByFilter(TemplateEnvelopeFilterDto templateEnvelopeFilterDto,
			Long userId, boolean isAllEnvelopeTemplates, Pageable pageable);

	List<TemplateEnvelope> findLatestEnvelopeTemplates(Long userId, boolean showAllTemplates,
			int envelopeTemplateDefaultLimit);

	List<TemplateEnvelope> findEnvelopeTemplateByName(String searchKeyword, boolean showAllTemplates, Long userId);

}
