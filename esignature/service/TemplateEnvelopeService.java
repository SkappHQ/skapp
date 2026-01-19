package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.template.TemplateEnvelopeDto;
import com.skapp.enterprise.esignature.payload.request.template.TemplateEnvelopeFilterDto;

public interface TemplateEnvelopeService {

	ResponseEntityDto createNewEnvelopeTemplate(TemplateEnvelopeDto envelopeTemplateDto);

	ResponseEntityDto searchTemplateNameExists(String name);

	ResponseEntityDto getEnvelopeTemplates(TemplateEnvelopeFilterDto templateEnvelopeFilterDto);

	ResponseEntityDto getEnvelopeTemplateById(Long id);

	ResponseEntityDto deleteEnvelopeTemplate(Long id);

}
