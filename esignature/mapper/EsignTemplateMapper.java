package com.skapp.enterprise.esignature.mapper;

import com.skapp.enterprise.esignature.model.TemplateDocument;
import com.skapp.enterprise.esignature.model.TemplateEnvelope;
import com.skapp.enterprise.esignature.payload.request.DocumentDto;
import com.skapp.enterprise.esignature.payload.response.template.DocumentTemplateDetailResponseDto;
import com.skapp.enterprise.esignature.payload.response.template.EnvelopeTemplateDetailedResponseDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EsignTemplateMapper {

	EnvelopeTemplateDetailedResponseDto TemplateEnvelopeToEnvelopeTemplateDetailedResponseDto(
			TemplateEnvelope templateEnvelope);

	TemplateDocument documentDtoToTemplateDocument(DocumentDto documentDto);

	DocumentTemplateDetailResponseDto templateDocumentToDocumentTemplateDetailResponseDto(
			TemplateDocument templateDocument);

}
