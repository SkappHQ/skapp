package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.template.*;
import jakarta.validation.Valid;

public interface TemplateEnvelopeService {

	ResponseEntityDto createNewEnvelopeTemplate(TemplateEnvelopeDto envelopeTemplateDto);

	ResponseEntityDto searchTemplateNameExists(String name);

	ResponseEntityDto getEnvelopeTemplates(TemplateEnvelopeFilterDto templateEnvelopeFilterDto);

	ResponseEntityDto getEnvelopeTemplateById(Long id);

	ResponseEntityDto deleteEnvelopeTemplate(Long id);

	ResponseEntityDto transferEnvelopeTemplateCustody(Long id,
			EnvelopeTemplateCustodyTransferDto envelopeTemplateCustodyTransferDto);

	ResponseEntityDto editEnvelopeTemplate(Long id, TemplateEnvelopeUpdateRequestDto templateEnvelopeUpdateRequestDto);

	ResponseEntityDto searchEnvelopeTemplates(EnvelopeTemplateSearchDto envelopeTemplateSearchDto);

}
