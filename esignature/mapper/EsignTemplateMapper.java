package com.skapp.enterprise.esignature.mapper;

import com.skapp.enterprise.esignature.model.*;

import com.skapp.enterprise.esignature.payload.request.DocumentDto;
import com.skapp.enterprise.esignature.payload.request.template.TemplateFieldContainerDto;
import com.skapp.enterprise.esignature.payload.request.template.TemplateFieldDto;
import com.skapp.enterprise.esignature.payload.response.AdvanceFieldDetailResponseDto;
import com.skapp.enterprise.esignature.payload.response.FieldContainerResponseDto;
import com.skapp.enterprise.esignature.payload.response.FieldDetailResponseDto;
import com.skapp.enterprise.esignature.payload.response.template.*;
import com.skapp.enterprise.esignature.type.FieldType;
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
	FieldTemplateDetailResponseDto templateFieldToFieldTemplateDetailResponseDto(TemplateField templateField);

	TemplateFieldContainer templateFieldContainerDtoToTemplateFieldContainer(
			TemplateFieldContainerDto templateFieldContainerDto);

	TemplateField templateFieldDtoToTemplateField(TemplateFieldDto advanceFieldDto);

	TemplateFieldContainerResponseDto templateFieldContainerToTemplateFieldContainerResponseDto(
			TemplateFieldContainer templateFieldContainer);

	TemplateFieldOptionResponseDto templateFieldOptionToTemplateFieldOptionResponseDto(
			TemplateFieldOption templateFieldOption);

	@Mapping(target = "advanceTemplateFieldContainers",
			expression = "java(mapTemplateFieldContainers(templateRecipient))")
	@Mapping(target = "templateFields",
			expression = "java(mapNameAndDateFieldsToFieldResponseDto(templateRecipient.getTemplateFields()))")
	RecipientTemplateDetailResponseDto templateRecipientToRecipientTemplateDetailResponseDto(
			TemplateRecipient templateRecipient);

	default List<TemplateFieldContainerResponseDto> mapTemplateFieldContainers(TemplateRecipient templateRecipient) {
		if (templateRecipient.getTemplateFields() == null)
			return null;
		return templateRecipient.getTemplateFields()
			.stream()
			.map(TemplateField::getTemplateFieldContainer)
			.filter(java.util.Objects::nonNull)
			.distinct()
			.map(container -> {
				TemplateFieldContainerResponseDto dto = templateFieldContainerToTemplateFieldContainerResponseDto(
						container);
				// Filter fields belonging to this container
				List<AdvanceFieldTemplateDetailResponseDto> fieldsForContainer = templateRecipient.getTemplateFields()
					.stream()
					.filter(f -> container.equals(f.getTemplateFieldContainer()))
					.map(this::templateFieldToAdvanceFieldTemplateDetailResponseDto)
					.collect(Collectors.toList());
				dto.setTemplateFields(fieldsForContainer);
				return dto;
			})
			.collect(Collectors.toList());
	}

	AdvanceFieldTemplateDetailResponseDto templateFieldToAdvanceFieldTemplateDetailResponseDto(
			TemplateField templateField);

	default List<FieldTemplateDetailResponseDto> mapNameAndDateFieldsToFieldResponseDto(
			List<TemplateField> templateFields) {
		if (templateFields == null)
			return null;
		return templateFields.stream()
			.filter(f -> !(f.getType().equals(FieldType.TEXT) || f.getType().equals(FieldType.DROPDOWN)
					|| f.getType().equals(FieldType.CHECKBOX) || f.getType().equals(FieldType.RADIO_BUTTON)))
			.map(this::templateFieldToFieldTemplateDetailResponseDto)
			.collect(Collectors.toList());
	}

}
