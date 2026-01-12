package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.masterrepository.TenantDao;
import com.skapp.enterprise.common.model.master.Tenant;
import com.skapp.enterprise.common.type.Tier;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.mapper.EsignTemplateMapper;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.TemplateDocument;
import com.skapp.enterprise.esignature.model.TemplateEnvelope;
import com.skapp.enterprise.esignature.model.TemplateEnvelopeSetting;
import com.skapp.enterprise.esignature.model.TemplateField;
import com.skapp.enterprise.esignature.model.TemplateRecipient;
import com.skapp.enterprise.esignature.payload.request.template.EnvelopeTemplateDto;
import com.skapp.enterprise.esignature.payload.request.template.EnvelopeTemplateSettingDto;
import com.skapp.enterprise.esignature.payload.request.template.FieldTemplateDto;
import com.skapp.enterprise.esignature.payload.request.template.RecipientTemplateDto;
import com.skapp.enterprise.esignature.payload.response.template.EnvelopeTemplateDetailedResponseDto;
import com.skapp.enterprise.esignature.repository.AddressBookDao;
import com.skapp.enterprise.esignature.repository.TemplateDocumentDao;
import com.skapp.enterprise.esignature.repository.TemplateEnvelopeDao;
import com.skapp.enterprise.esignature.service.EnvelopeTemplateService;
import com.skapp.enterprise.esignature.type.EsignVerificationType;
import com.skapp.enterprise.esignature.type.MemberRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class EnvelopeTemplateServiceImpl implements EnvelopeTemplateService {

	private static final int ENVELOPE_TEMPLATE_NAME_MAX_LENGTH = 50;

	private static final int ENVELOPE_TEMPLATE_MAX_DOCUMENT_COUNT = 1;

	private static final int ENVELOPE_TEMPLATE_MAX_RECIPIENT_ROLE_LENGTH = 25;

	private final TenantContext tenantContext;

	private final TenantDao tenantDao;

	private final UserService userService;

	private final TemplateDocumentDao templateDocumentDao;

	private final TemplateEnvelopeDao templateEnvelopeDao;

	private final AddressBookDao addressBookDao;

	private final EsignTemplateMapper esignTemplateMapper;

	@Override
	public ResponseEntityDto createNewEnvelopeTemplate(EnvelopeTemplateDto envelopeTemplateDto) {

		User currentUser = userService.getCurrentUser();

		Optional<AddressBook> addressBookOptional = addressBookDao.findByInternalUser(currentUser);

		AddressBook addressBook = addressBookOptional.filter(AddressBook::getIsActive)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_USER_NOT_FOUND));

		processTierLimitation();

		TemplateEnvelope templateEnvelope = initializeTemplateEnvelope(envelopeTemplateDto);

		List<TemplateDocument> templateDocuments = assignTemplateDocumentsToTemplateEnvelope(
				envelopeTemplateDto.getTemplateDocumentIds(), templateEnvelope);

		templateEnvelope.setTemplateDocuments(templateDocuments);

		List<TemplateRecipient> templateRecipients = assignTemplateRecipientsToTemplateEnvelope(
				envelopeTemplateDto.getTemplateRecipients(), templateEnvelope,
				envelopeTemplateDto.getTemplateDocumentIds());

		templateEnvelope.setTemplateRecipients(templateRecipients);

		TemplateEnvelopeSetting templateEnvelopeSetting = buildTemplateEnvelopeSetting(
				envelopeTemplateDto.getTemplateEnvelopeSettingDto(), templateEnvelope);

		templateEnvelope.setTemplateEnvelopeSetting(templateEnvelopeSetting);
		templateEnvelope.setOwner(addressBook);

		TemplateEnvelope savedTemplateEnvelope = templateEnvelopeDao.save(templateEnvelope);

		EnvelopeTemplateDetailedResponseDto responseDto = esignTemplateMapper
			.templateEnvelopeToEnvelopeTemplateDetailedResponseDto(savedTemplateEnvelope);

		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	public ResponseEntityDto searchTemplateNameExists(String name) {

		Optional<TemplateEnvelope> templateEnvelopeOptional = templateEnvelopeDao.findByNameIgnoreCase(name.trim());

		if (templateEnvelopeOptional.isPresent()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_TEMPLATE_NAME_ALREADY_EXISTS);
		}

		return new ResponseEntityDto(false, true);

	}

	private void processTierLimitation() {

		String currentTenant = TenantContext.getCurrentTenant();

		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
		Tenant tenant = tenantDao.findByTenantName(currentTenant);
		tenantContext.setTenantAndSwitchSchema(currentTenant);

		if (tenant == null) {
			log.error("getEnvelopeTemplateTierLimitation: Tenant not found: {}", currentTenant);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_NOT_FOUND,
					new String[] { currentTenant });
		}

		Tier tier = tenant.getTier();

		if (tier == Tier.FREE) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_STATUS_NOT_PRO_ACCOUNT);
		}

	}

	private TemplateEnvelope initializeTemplateEnvelope(EnvelopeTemplateDto envelopeTemplateDto) {

		validateEnvelopeTemplateName(envelopeTemplateDto.getName());

		TemplateEnvelope templateEnvelope = new TemplateEnvelope();
		templateEnvelope.setName(envelopeTemplateDto.getName());
		templateEnvelope.setSubject(envelopeTemplateDto.getSubject());
		templateEnvelope.setMessage(envelopeTemplateDto.getMessage());
		templateEnvelope.setSignType(envelopeTemplateDto.getSignType());
		return templateEnvelope;

	}

	private List<TemplateDocument> assignTemplateDocumentsToTemplateEnvelope(List<Long> documentIds,
			TemplateEnvelope templateEnvelope) {

		validateEnvelopeTemplateDocument(documentIds);

		List<TemplateDocument> templateDocuments = templateDocumentDao.findAllById(documentIds);

		if (templateDocuments.size() != documentIds.size()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_TEMPLATE_DOCUMENT_ID_NOT_FOUND);
		}

		// Check if any of the documents already have an envelope
		List<TemplateDocument> alreadyAssignedTemplateDocuments = templateDocuments.stream()
			.filter(doc -> doc.getTemplateEnvelope() != null)
			.toList();

		if (!alreadyAssignedTemplateDocuments.isEmpty()) {
			throw new ModuleException(
					EsignMessageConstant.ESIGN_ERROR_TEMPLATE_DOCUMENT_ALREADY_ASSIGNED_TO_TEMPLATE_ENVELOPE);
		}
		templateDocuments.forEach(doc -> doc.setTemplateEnvelope(templateEnvelope));
		return templateDocuments;

	}

	private List<TemplateRecipient> assignTemplateRecipientsToTemplateEnvelope(List<RecipientTemplateDto> recipients,
			TemplateEnvelope templateEnvelope, List<Long> documentIds) {

		validateEnvelopeTemplateRecipients(recipients, documentIds);

		return recipients.stream().map(templateRecipientDto -> {

			AddressBook addressBook = null;

			if (templateRecipientDto.getAddressBookId() != null) {
				addressBook = addressBookDao.findById(templateRecipientDto.getAddressBookId())
					.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_ID_NOT_FOUND));

				if (Boolean.FALSE.equals(addressBook.getIsActive())) {
					throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_USER_NOT_FOUND);
				}
			}

			if (templateRecipientDto.getMemberRole() == MemberRole.CC
					&& !templateRecipientDto.getTemplateFields().isEmpty()) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_CC_RECIPIENT_CANNOT_HAVE_FIELDS);
			}

			TemplateRecipient templateRecipient = new TemplateRecipient();
			templateRecipient.setAddressBook(addressBook);
			templateRecipient.setRecipientRole(templateRecipientDto.getRecipientRole());
			templateRecipient.setMemberRole(templateRecipientDto.getMemberRole());
			templateRecipient.setSigningOrder(templateRecipientDto.getSigningOrder());
			templateRecipient.setColor(templateRecipientDto.getColor());
			templateRecipient.setAddressBook(templateRecipientDto.getAddressBookId() != null ? addressBook : null);
			templateRecipient
				.setMfaVerificationEnabled(templateRecipientDto.getVerificationType() != EsignVerificationType.NONE);
			templateRecipient.setMfaVerificationMethod(templateRecipientDto.getVerificationType());
			templateRecipient.setTemplateEnvelope(templateEnvelope);

			List<TemplateField> templateFields = buildTemplateFieldsForRecipient(
					templateRecipientDto.getTemplateFields(), templateRecipient);
			templateRecipient.setTemplateFields(templateFields);

			return templateRecipient;
		}).toList();

	}

	private List<TemplateField> buildTemplateFieldsForRecipient(List<FieldTemplateDto> templateFields,
			TemplateRecipient templateRecipient) {

		return templateFields.stream().map(templateFieldDto -> {

			TemplateDocument templateFieldDocument = templateDocumentDao
				.findById(templateFieldDto.getTemplateDocumentId())
				.orElseThrow(
						() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_TEMPLATE_DOCUMENT_ID_NOT_FOUND));

			TemplateField templateField = new TemplateField();
			templateField.setType(templateFieldDto.getType());
			templateField.setPageNumber(templateFieldDto.getPageNumber());
			templateField.setXPosition(templateFieldDto.getXposition());
			templateField.setYPosition(templateFieldDto.getYposition());
			templateField.setWidth(templateFieldDto.getWidth());
			templateField.setHeight(templateFieldDto.getHeight());
			templateField.setTemplateDocument(templateFieldDocument);
			templateField.setTemplateRecipient(templateRecipient);

			return templateField;
		}).toList();

	}

	private TemplateEnvelopeSetting buildTemplateEnvelopeSetting(EnvelopeTemplateSettingDto templateEnvelopeSettingDto,
			TemplateEnvelope templateEnvelope) {

		TemplateEnvelopeSetting templateEnvelopeSetting = new TemplateEnvelopeSetting();
		templateEnvelopeSetting.setReminderDays(templateEnvelopeSettingDto.getReminderDays());
		templateEnvelopeSetting.setTemplateEnvelope(templateEnvelope);
		return templateEnvelopeSetting;

	}

	private void validateEnvelopeTemplateName(String envelopeTemplateName) {

		if (envelopeTemplateName == null || envelopeTemplateName.trim().isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_TEMPLATE_NAME_REQUIRED);
		}

		if (envelopeTemplateName.length() > ENVELOPE_TEMPLATE_NAME_MAX_LENGTH) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_TEMPLATE_NAME_MAX_LENGTH_EXCEEDED);
		}

		Optional<TemplateEnvelope> templateEnvelopeOptional = templateEnvelopeDao
			.findByNameIgnoreCase(envelopeTemplateName.trim());

		if (templateEnvelopeOptional.isPresent()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_TEMPLATE_NAME_ALREADY_EXISTS);
		}

	}

	private void validateEnvelopeTemplateDocument(List<Long> documentIds) {

		List<Long> ids = documentIds.stream().filter(Objects::nonNull).distinct().toList();

		if (ids.isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_TEMPLATE_DOCUMENT_REQUIRED);
		}

		if (ids.size() > ENVELOPE_TEMPLATE_MAX_DOCUMENT_COUNT) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_TEMPLATE_DOCUMENT_MAX_LIMIT_EXCEEDED);
		}
	}

	private void validateEnvelopeTemplateRecipients(List<RecipientTemplateDto> recipientTemplates,
			List<Long> documentIds) {

		boolean noRecipientFieldDocuments = recipientTemplates.stream()
			.flatMap(recipient -> recipient.getTemplateFields().stream())
			.anyMatch(field -> field.getTemplateDocumentId() == null);

		if (noRecipientFieldDocuments) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_TEMPLATE_RECIPIENT_FIELD_DOCUMENT_ID_REQUIRED);
		}

		boolean hasInvalidDocumentId = recipientTemplates.stream()
			.flatMap(recipient -> recipient.getTemplateFields().stream())
			.anyMatch(field -> !documentIds.contains(field.getTemplateDocumentId()));

		if (hasInvalidDocumentId) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_INVALID_TEMPLATE_DOCUMENT_ID);
		}

		boolean hasNoRecipientRole = recipientTemplates.stream()
			.anyMatch(
					recipient -> recipient.getRecipientRole() == null || recipient.getRecipientRole().trim().isEmpty());

		if (hasNoRecipientRole) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_TEMAPLATE_RECIPIENT_ROLE_REQUIRED);
		}

		boolean exceedMaxRecipientRoleLength = recipientTemplates.stream()
			.anyMatch(recipient -> recipient.getRecipientRole().length() > ENVELOPE_TEMPLATE_MAX_RECIPIENT_ROLE_LENGTH);

		if (exceedMaxRecipientRoleLength) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_TEMAPLATE_RECIPIENT_ROLE_MAX_LENGTH_EXCEEDED);
		}

		boolean duplicateRecipientRole = recipientTemplates.stream()
			.map(RecipientTemplateDto::getRecipientRole)
			.filter(Objects::nonNull)
			.map(String::toLowerCase)
			.distinct()
			.count() < recipientTemplates.stream()
				.map(RecipientTemplateDto::getRecipientRole)
				.filter(Objects::nonNull)
				.count();

		if (duplicateRecipientRole) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_TEMAPLATE_RECIPIENT_ROLE_DUPLICATED);
		}

	}

}
