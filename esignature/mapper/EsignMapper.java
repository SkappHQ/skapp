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
import com.skapp.enterprise.esignature.payload.request.*;
import com.skapp.enterprise.esignature.payload.response.AddressBookBasicResponseDto;
import com.skapp.enterprise.esignature.payload.response.AddressBookResponseDto;
import com.skapp.enterprise.esignature.payload.response.DocumentDetailResponseDto;
import com.skapp.enterprise.esignature.payload.response.DocumentLinkResponseDto;
import com.skapp.enterprise.esignature.payload.response.EnvelopeDetailedResponseDto;
import com.skapp.enterprise.esignature.payload.response.EnvelopeSettingResponseDto;
import com.skapp.enterprise.esignature.payload.response.EsignConfigResponseDto;
import com.skapp.enterprise.esignature.payload.response.ExternalUserResponseDto;
import com.skapp.enterprise.esignature.payload.response.FieldContainerResponseDto;
import com.skapp.enterprise.esignature.payload.response.FieldDetailResponseDto;
import com.skapp.enterprise.esignature.payload.response.FieldOptionResponseDto;
import com.skapp.enterprise.esignature.payload.response.FieldResponseDto;
import com.skapp.enterprise.esignature.payload.response.FieldValueResponseDto;
import com.skapp.enterprise.esignature.payload.response.InternalUserResponseDto;
import com.skapp.enterprise.esignature.payload.response.MySignatureLinkResponseDto;
import com.skapp.enterprise.esignature.payload.response.RecipientDetailResponseDto;
import com.skapp.enterprise.esignature.payload.response.RecipientResponseDto;
import com.skapp.enterprise.esignature.payload.response.SignatureCertificateResponseDto;
import com.skapp.enterprise.esignature.repository.projection.EnvelopeInboxData;
import com.skapp.enterprise.esignature.repository.projection.EnvelopeSentData;
import com.skapp.enterprise.esignature.type.DateFormatType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

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
	@Mapping(target = "fieldContainers", expression = "java(mapFieldContainers(recipient))")
	RecipientDetailResponseDto recipientToRecipientDetailDto(Recipient recipient);

	@Mapping(target = "documentId", source = "document.id")
	@Mapping(target = "recipientMail", source = "recipient.email")
	@Mapping(target = "fieldContainerId", source = "fieldContainer.id")
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

	@Mapping(target = "fieldContainerId", source = "fieldContainer.id")
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

	default List<FieldContainerResponseDto> mapFieldContainers(Recipient recipient) {
		if (recipient.getFields() == null)
			return null;
		return recipient.getFields()
			.stream()
			.map(Field::getFieldContainer)
			.filter(java.util.Objects::nonNull)
			.distinct()
			.map(this::fieldContainerToFieldContainerResponseDto)
			.collect(java.util.stream.Collectors.toList());
	}

	FieldSignContainerDto fieldContainerToFieldSignContainerDto(FieldContainer fieldContainer);

}
