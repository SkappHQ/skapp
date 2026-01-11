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
import com.skapp.enterprise.esignature.model.*;
import com.skapp.enterprise.esignature.payload.request.template.EnvelopeTemplateDto;
import com.skapp.enterprise.esignature.payload.request.template.FieldTemplateDto;
import com.skapp.enterprise.esignature.payload.request.template.RecipientTemplateDto;
import com.skapp.enterprise.esignature.repository.AddressBookDao;
import com.skapp.enterprise.esignature.repository.TemplateDocumentDao;
import com.skapp.enterprise.esignature.repository.TemplateEnvelopeDao;
import com.skapp.enterprise.esignature.service.EnvelopeTemplateService;
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

	@Override
	public ResponseEntityDto createNewEnvelopeTemplate(EnvelopeTemplateDto envelopeTemplateDto) {

		User currentUser = userService.getCurrentUser();

		processTierLimitation();

		TemplateEnvelope templateEnvelope = initializeTemplateEnvelope(envelopeTemplateDto);

		List<TemplateDocument> templateDocuments = assignTemplateDocumentsToTemplateEnvelope(
				envelopeTemplateDto.getDocumentIds(), templateEnvelope);

		templateEnvelope.setTemplateDocuments(templateDocuments);

		List<TemplateRecipient> templateRecipients = assignTemplateRecipientsToTemplateEnvelope(
				envelopeTemplateDto.getRecipients(), templateEnvelope, envelopeTemplateDto.getDocumentIds());

		return null;
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

			if (templateRecipientDto.getMemberRole() == MemberRole.CC && !templateRecipientDto.getFields().isEmpty()) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_CC_RECIPIENT_CANNOT_HAVE_FIELDS);
			}

			TemplateRecipient templateRecipient = new TemplateRecipient();
			templateRecipient.setAddressBook(addressBook);
			templateRecipient.setRecipientRole(templateRecipientDto.getRecipientRole());
			templateRecipient.setMemberRole(templateRecipientDto.getMemberRole());
			templateRecipient.setSigningOrder(templateRecipientDto.getSigningOrder());
			templateRecipient.setColor(templateRecipientDto.getColor());
			templateRecipient.setTemplateEnvelope(templateEnvelope);

			List<TemplateField> templateFields = buildTemplateFieldsForRecipient(templateRecipientDto.getFields(),
					templateRecipient);
			templateRecipient.setTemplateFields(templateFields);

			return templateRecipient;
		}).toList();

	}

	private List<TemplateField> buildTemplateFieldsForRecipient(List<FieldTemplateDto> fields,
			TemplateRecipient templateRecipient) {
		return null;
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
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_TEMPLATE_NAME_DUPLICATED);
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

		boolean hasInvalidDocumentId = recipientTemplates.stream()
			.flatMap(recipient -> recipient.getFields().stream())
			.anyMatch(field -> !documentIds.contains(field.getDocumentId()));

		if (hasInvalidDocumentId) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_INVALID_TEMPLATE_DOCUMENT_ID);
		}

		boolean hasNoRecipientRole = recipientTemplates.stream()
			.anyMatch(recipient -> recipient.getRecipientRole() == null);

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
