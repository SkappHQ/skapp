package com.skapp.enterprise.esignature.mapper;

import com.skapp.community.common.model.User;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.DocumentLink;
import com.skapp.enterprise.esignature.model.DocumentVersionField;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.EnvelopeSetting;
import com.skapp.enterprise.esignature.model.EsignConfig;
import com.skapp.enterprise.esignature.model.ExternalUser;
import com.skapp.enterprise.esignature.model.Field;
import com.skapp.enterprise.esignature.model.FieldContainer;
import com.skapp.enterprise.esignature.model.FieldOption;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.payload.email.EpEsignEmailEnvelopeDataDto;
import com.skapp.enterprise.esignature.payload.request.DocumentDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeDetailDto;
import com.skapp.enterprise.esignature.payload.request.ExternalUserDto;
import com.skapp.enterprise.esignature.payload.request.FieldContainerDto;
import com.skapp.enterprise.esignature.payload.request.FieldDto;
import com.skapp.enterprise.esignature.payload.request.FieldSignDto;
import com.skapp.enterprise.esignature.payload.request.RecipientDto;
import com.skapp.enterprise.esignature.payload.response.*;
import com.skapp.enterprise.esignature.repository.projection.EnvelopeInboxData;
import com.skapp.enterprise.esignature.repository.projection.EnvelopeSentData;
import com.skapp.enterprise.esignature.type.DateFormatType;
import com.skapp.enterprise.esignature.type.FieldType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface EsignMapper {

	String COMPLETE_VIA_SKAPP_REGEX = "^Complete via Skapp\\s*-?\\s*";

	ExternalUser externalUserDtoToExternalUser(ExternalUserDto externalUserDto);

	@Named("externalUserToExternalUserResponseDto")
	@Mapping(source = "externalUser.id", target = "userId")
	ExternalUserResponseDto externalUserToExternalUserResponseDto(ExternalUser externalUser);

	@Named("userToInternalUserResponseDto")
	@Mapping(source = "user.employee.firstName", target = "firstName")
	@Mapping(source = "user.employee.lastName", target = "lastName")
	@Mapping(source = "user.employee.phone", target = "phone")
	@Mapping(source = "user.userId", target = "userId")
	@Mapping(source = "user.email", target = "email")
	InternalUserResponseDto userToInternalUserResponseDto(User user);

	@Mapping(source = "internalUser", target = "internalUserResponseDto",
			qualifiedByName = "userToInternalUserResponseDto")
	@Mapping(source = "externalUser", target = "externalUserResponseDto",
			qualifiedByName = "externalUserToExternalUserResponseDto")
	AddressBookResponseDto addressBookToAddressBookResponseDto(AddressBook addressBook);

	@Mapping(target = "id", ignore = true)
	@Mapping(target = "sentAt", ignore = true)
	@Mapping(target = "completedAt", ignore = true)
	@Mapping(target = "declinedAt", ignore = true)
	@Mapping(target = "documents", ignore = true)
	@Mapping(target = "recipients", ignore = true)
	@Mapping(target = "setting", ignore = true)
	Envelope envelopeDetailDtoToEnvelope(EnvelopeDetailDto envelopeDetailDto);

	@Mapping(target = "id", ignore = true)
	@Mapping(target = "fields", ignore = true)
	@Mapping(target = "addressBook", ignore = true)
	Recipient recipientDtoToRecipient(RecipientDto recipientDto);

	@Mapping(target = "id", ignore = true)
	@Mapping(target = "document", ignore = true)
	@Mapping(target = "recipient", ignore = true)
	Field fieldDtoToField(FieldDto fieldDto);

	EnvelopeDetailedResponseDto envelopeToEnvelopeDetailedResponseDto(Envelope envelope);

	DocumentDetailResponseDto documentToDocumentDetailDto(Document document);

	@Mapping(target = "addressBookId", source = "addressBook.id")
	@Mapping(target = "advanceFieldContainers", expression = "java(mapFieldContainers(recipient))")
	@Mapping(target = "fields", expression = "java(mapNameAndDateFieldsToFieldResponseDto(recipient.getFields()))")
	RecipientDetailResponseDto recipientToRecipientDetailDto(Recipient recipient);

	@Mapping(target = "documentId", source = "document.id")
	@Mapping(target = "recipientMail", source = "recipient.email")
	FieldDetailResponseDto fieldToFieldDetailDto(Field field);

	@Mapping(target = "envelopeId", source = "id")
	@Mapping(target = "envelopeName", source = "name")
	@Mapping(target = "envelopeMessage", source = "message")
	@Mapping(target = "envelopeSubject", source = "subject")
	@Mapping(target = "reminderDays", source = "setting.reminderDays")
	EpEsignEmailEnvelopeDataDto envelopeToEpEsignEmailEnvelopeDataDto(Envelope envelope);

	Document documentDtoToDocument(DocumentDto documentDto);

	@Mapping(source = "dateFormat", target = "dateFormat", qualifiedByName = "mapDateFormat")
	EsignConfigResponseDto esignConfigToEsignConfigResponseDto(EsignConfig esignConfig);

	@Named("mapDateFormat")
	default String mapDateFormat(DateFormatType dateFormat) {
		return dateFormat != null ? dateFormat.getValue() : null;
	}

	EnvelopeSettingResponseDto envelopeSettingToEnvelopeSettingResponseDto(EnvelopeSetting setting);

	RecipientResponseDto recipientToRecipientResponseDto(Recipient recipient);

	FieldResponseDto fieldToFieldResponseDto(Field field);

	FieldValueResponseDto documentVersionFieldToFieldValueResponseDto(DocumentVersionField documentVersionField);

	DocumentLinkResponseDto documentLinkToDocumentLinkResponseDto(DocumentLink documentLink);

	@Mapping(source = "id", target = "envelopeId")
	@Mapping(source = "owner", target = "sender")
	@Mapping(source = "setting.expirationDate", target = "expiresAt")
	@Mapping(source = "subject", target = "title", qualifiedByName = "cleanSubject")
	EnvelopeSentData envelopeToEnvelopeSentData(Envelope envelope);

	@Mapping(source = "id", target = "id")
	@Mapping(source = "userId", target = "userId")
	@Mapping(source = "firstName", target = "firstName")
	@Mapping(source = "lastName", target = "lastName")
	@Mapping(source = "internalUser.employee.authPic", target = "profilePic")
	@Mapping(target = "mySignatureLink", ignore = true)
	AddressBookBasicResponseDto addressBookToAddressBookBasicResponseDto(AddressBook addressBook);

	List<RecipientResponseDto> recipientToRecipinetResponseDtoList(List<Recipient> recipients);

	@Mapping(source = "id", target = "envelopeId")
	@Mapping(source = "owner", target = "sender")
	@Mapping(target = "status", ignore = true)
	@Mapping(target = "receivedDate", ignore = true)
	@Mapping(source = "setting.expirationDate", target = "expiresAt")
	@Mapping(source = "subject", target = "title", qualifiedByName = "cleanSubject")
	EnvelopeInboxData envelopeToEnvelopeInboxData(Envelope envelope);

	@Mapping(source = "id", target = "addressBookId")
	@Mapping(target = "mySignatureLink", ignore = true)
	MySignatureLinkResponseDto addressBookToMySignatureLinkResponseDto(AddressBook addressBook);

	SignatureCertificateResponseDto envelopeToSignatureCertificateResponseDto(Envelope envelope);

	@Mapping(source = "id", target = "fieldId")
	@Mapping(source = "XPosition", target = "xposition")
	@Mapping(source = "YPosition", target = "yposition")
	FieldSignDto fieldToFieldSignDto(Field field);

	@Named("cleanSubject")
	static String cleanSubject(String subject) {
		if (subject == null)
			return null;
		return subject.replaceFirst(COMPLETE_VIA_SKAPP_REGEX, "");
	}

	FieldOptionResponseDto fieldOptionToFieldOptionResponseDto(FieldOption fieldOption);

	FieldContainerResponseDto fieldContainerToFieldContainerResponseDto(FieldContainer fieldContainer);

	// Java
	default List<FieldContainerResponseDto> mapFieldContainers(Recipient recipient) {
		if (recipient.getFields() == null)
			return null;
		return recipient.getFields()
			.stream()
			.map(Field::getFieldContainer)
			.filter(java.util.Objects::nonNull)
			.distinct()
			.map(container -> {
				FieldContainerResponseDto dto = fieldContainerToFieldContainerResponseDto(container);
				// Filter fields belonging to this container
				List<AdvanceFieldDetailResponseDto> fieldsForContainer = recipient.getFields()
					.stream()
					.filter(f -> container.equals(f.getFieldContainer()))
					.map(this::fieldToAdvanceFieldDetailResponseDto)
					.collect(Collectors.toList());
				dto.setFields(fieldsForContainer);
				return dto;
			})
			.collect(Collectors.toList());
	}

	FieldContainer fieldContainerDtoToFieldContainer(FieldContainerDto fieldContainerDto);

	AdvanceFieldDetailResponseDto fieldToAdvanceFieldDetailResponseDto(Field field);

	default List<FieldDetailResponseDto> mapNameAndDateFieldsToFieldResponseDto(List<Field> fields) {
		if (fields == null)
			return null;
		return fields.stream()
			.filter(f -> !(f.getType().equals(FieldType.TEXT) || f.getType().equals(FieldType.DROPDOWN)
					|| f.getType().equals(FieldType.CHECKBOX) || f.getType().equals(FieldType.RADIO_BUTTON)))
			.map(this::fieldToFieldDetailDto)
			.collect(Collectors.toList());
	}

}
