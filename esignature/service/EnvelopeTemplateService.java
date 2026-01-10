package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.template.EnvelopeTemplateDto;

public interface EnvelopeTemplateService {

	ResponseEntityDto createNewEnvelopeTemplate(EnvelopeTemplateDto envelopeTemplateDto);

}
