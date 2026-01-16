package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.TemplateEnvelope;
import com.skapp.enterprise.esignature.payload.request.template.TemplateEnvelopeFilterDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public interface TemplateEnvelopeRepository {

	Page<TemplateEnvelope> findAllTemplateEnvelopesByFilter(TemplateEnvelopeFilterDto templateEnvelopeFilterDto,
			Long userId, boolean isAllSentEnvelopes, Pageable pageable);

}
