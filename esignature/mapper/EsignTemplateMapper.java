package com.skapp.enterprise.esignature.mapper;

import com.skapp.enterprise.esignature.model.TemplateDocument;
import com.skapp.enterprise.esignature.model.TemplateEnvelope;
import com.skapp.enterprise.esignature.payload.request.DocumentDto;
import com.skapp.enterprise.esignature.payload.response.template.DocumentTemplateDetailResponseDto;
import com.skapp.enterprise.esignature.payload.response.template.EnvelopeTemplateDetailedResponseDto;
import com.skapp.enterprise.esignature.payload.response.template.TemplateEnvelopeResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EsignTemplateMapper {

	EnvelopeTemplateDetailedResponseDto templateEnvelopeToEnvelopeTemplateDetailedResponseDto(
			TemplateEnvelope templateEnvelope);

	TemplateDocument documentDtoToTemplateDocument(DocumentDto documentDto);

	DocumentTemplateDetailResponseDto templateDocumentToDocumentTemplateDetailResponseDto(
			TemplateDocument templateDocument);

	@Mapping(source = "createdDate", target = "createdDate")
	@Mapping(source = "lastModifiedDate", target = "lastModifiedDate")
	TemplateEnvelopeResponseDto templateEnvelopeToTemplateEnvelopeData(TemplateEnvelope templateEnvelope);

}
