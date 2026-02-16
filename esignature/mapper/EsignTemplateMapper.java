package com.skapp.enterprise.esignature.mapper;

import com.skapp.enterprise.esignature.model.TemplateDocument;
import com.skapp.enterprise.esignature.model.TemplateEnvelope;
import com.skapp.enterprise.esignature.model.TemplateField;
import com.skapp.enterprise.esignature.model.TemplateFieldContainer;
import com.skapp.enterprise.esignature.model.TemplateFieldOption;
import com.skapp.enterprise.esignature.model.TemplateRecipient;

import com.skapp.enterprise.esignature.payload.request.DocumentDto;
import com.skapp.enterprise.esignature.payload.request.template.TemplateFieldContainerDto;
import com.skapp.enterprise.esignature.payload.request.template.TemplateFieldDto;
import com.skapp.enterprise.esignature.payload.response.template.DocumentTemplateDetailResponseDto;
import com.skapp.enterprise.esignature.payload.response.template.EnvelopeTemplateDetailedResponseDto;
import com.skapp.enterprise.esignature.payload.response.template.FieldTemplateDetailResponseDto;
import com.skapp.enterprise.esignature.payload.response.template.RecipientTemplateDetailResponseDto;
import com.skapp.enterprise.esignature.payload.response.template.TemplateEnvelopeBasicInfoDto;
import com.skapp.enterprise.esignature.payload.response.template.TemplateEnvelopeResponseDto;
import com.skapp.enterprise.esignature.payload.response.template.TemplateFieldContainerResponseDto;
import com.skapp.enterprise.esignature.payload.response.template.TemplateFieldOptionResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.stream.Collectors;

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

	TemplateEnvelopeBasicInfoDto templateEnvelopeToTemplateEnvelopeBasicInfoDto(TemplateEnvelope templateEnvelope);

	@Mapping(source = "templateDocument.id", target = "documentId")
	@Mapping(target = "templateFieldContainerId", source = "templateFieldContainer.id")
	FieldTemplateDetailResponseDto templateFieldToFieldTemplateDetailResponseDto(TemplateField templateField);

	TemplateFieldContainer templateFieldContainerDtoToTemplateFieldContainer(
			TemplateFieldContainerDto templateFieldContainerDto);

	TemplateField templateFieldDtoToTemplateField(TemplateFieldDto advanceFieldDto);

	default List<TemplateFieldContainerResponseDto> mapTemplateFieldContainers(TemplateRecipient templateRecipient) {
		if (templateRecipient.getTemplateFields() == null)
			return null;
		return templateRecipient.getTemplateFields()
			.stream()
			.map(TemplateField::getTemplateFieldContainer)
			.filter(java.util.Objects::nonNull)
			.distinct()
			.map(this::templateFieldContainerToTemplateFieldContainerResponseDto)
			.collect(Collectors.toList());
	}

	TemplateFieldContainerResponseDto templateFieldContainerToTemplateFieldContainerResponseDto(
			TemplateFieldContainer templateFieldContainer);

	TemplateFieldOptionResponseDto templateFieldOptionToTemplateFieldOptionResponseDto(
			TemplateFieldOption templateFieldOption);

	@Mapping(target = "advanceTemplateFieldContainers",
			expression = "java(mapTemplateFieldContainers(templateRecipient))")
	RecipientTemplateDetailResponseDto templateRecipientToRecipientTemplateDetailResponseDto(
			TemplateRecipient templateRecipient);

}
