package com.skapp.enterprise.esignature.mapper;

import com.skapp.enterprise.esignature.model.TemplateEnvelope;
import com.skapp.enterprise.esignature.payload.response.template.EnvelopeTemplateDetailedResponseDto;

public interface EsignTemplateMapper {

	EnvelopeTemplateDetailedResponseDto envelopeToEnvelopeDetailedResponseDto(TemplateEnvelope templateEnvelope);

}
