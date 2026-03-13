package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.masterrepository.TenantDao;
import com.skapp.enterprise.common.model.master.Tenant;
import com.skapp.enterprise.common.type.Tier;
import com.skapp.enterprise.esignature.constant.EsignConstants;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.mapper.EsignTemplateMapper;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.TemplateDocument;
import com.skapp.enterprise.esignature.model.TemplateEnvelope;
import com.skapp.enterprise.esignature.model.TemplateEnvelopeSetting;
import com.skapp.enterprise.esignature.model.TemplateField;
import com.skapp.enterprise.esignature.model.TemplateFieldContainer;
import com.skapp.enterprise.esignature.model.TemplateFieldOption;
import com.skapp.enterprise.esignature.model.TemplateRecipient;
import com.skapp.enterprise.esignature.payload.request.FieldContainerDto;
import com.skapp.enterprise.esignature.payload.request.template.AdvanceTemplateFieldDto;
import com.skapp.enterprise.esignature.payload.request.template.EnvelopeTemplateCustodyTransferDto;
import com.skapp.enterprise.esignature.payload.request.template.TemplateEnvelopeDto;
import com.skapp.enterprise.esignature.payload.request.template.TemplateEnvelopeFilterDto;
import com.skapp.enterprise.esignature.payload.request.template.TemplateEnvelopeSettingDto;
import com.skapp.enterprise.esignature.payload.request.template.TemplateEnvelopeUpdateRequestDto;
import com.skapp.enterprise.esignature.payload.request.template.TemplateFieldContainerDto;
import com.skapp.enterprise.esignature.payload.request.template.TemplateFieldDto;
import com.skapp.enterprise.esignature.payload.request.template.TemplateRecipientDto;
import com.skapp.enterprise.esignature.payload.response.template.EnvelopeTemplateDetailedResponseDto;
import com.skapp.enterprise.esignature.payload.response.template.TemplateEnvelopeBasicInfoDto;
import com.skapp.enterprise.esignature.payload.response.template.TemplateEnvelopeResponseDto;
import com.skapp.enterprise.esignature.repository.AddressBookDao;
import com.skapp.enterprise.esignature.repository.TemplateDocumentDao;
import com.skapp.enterprise.esignature.repository.TemplateEnvelopeDao;
import com.skapp.enterprise.esignature.repository.TemplateFieldContainerDao;
import com.skapp.enterprise.esignature.repository.TemplateRecipientDao;
import com.skapp.enterprise.esignature.service.TemplateDocumentService;
import com.skapp.enterprise.esignature.service.TemplateEnvelopeService;
import com.skapp.enterprise.esignature.type.EsignVerificationType;
import com.skapp.enterprise.esignature.type.FieldType;
import com.skapp.enterprise.esignature.type.MemberRole;
import com.skapp.enterprise.esignature.type.UserType;
import com.skapp.enterprise.esignature.util.EsignUtil;
import com.skapp.enterprise.esignature.util.EsignValidations;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TemplateEnvelopeServiceImpl implements TemplateEnvelopeService {

	private static final int ENVELOPE_TEMPLATE_NAME_MAX_LENGTH = 50;

	private static final int ENVELOPE_TEMPLATE_MAX_DOCUMENT_COUNT = 1;

	private static final int ENVELOPE_TEMPLATE_MAX_RECIPIENT_ROLE_LENGTH = 25;

	private static final int ENVELOPE_TEMPLATE_DEFAULT_LIMIT = 4;

	private final TenantContext tenantContext;

	private final TenantDao tenantDao;

	private final UserService userService;

	private final TemplateDocumentDao templateDocumentDao;

	private final TemplateEnvelopeDao templateEnvelopeDao;

	private final TemplateRecipientDao templateRecipientDao;

	private final AddressBookDao addressBookDao;

	private final TemplateFieldContainerDao templateFieldContainerDao;

	private final EsignTemplateMapper esignTemplateMapper;

	private final MessageUtil messageUtil;

	private final TemplateDocumentService templateDocumentService;

	@Value("${aws.s3.bucket-name}")
	private String bucketName;

	@Value("${aws.cloudfront.s3-default.domain-name}")
	private String cloudFrontDomain;

	@Override
	@Transactional
	public ResponseEntityDto createNewEnvelopeTemplate(TemplateEnvelopeDto envelopeTemplateDto) {

		User currentUser = userService.getCurrentUser();

		Optional<AddressBook> addressBookOptional = addressBookDao.findByInternalUser(currentUser);

		AddressBook addressBook = addressBookOptional.filter(AddressBook::getIsActive)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_USER_NOT_FOUND));

		processTierLimitation();

		TemplateEnvelope templateEnvelope = initializeTemplateEnvelope(envelopeTemplateDto);

		List<TemplateDocument> templateDocuments = assignTemplateDocumentsToTemplateEnvelope(
				envelopeTemplateDto.getTemplateDocumentIds(), templateEnvelope, false);

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

		if (name == null || name.trim().isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_TEMPLATE_NAME_REQUIRED);
		}

		Optional<TemplateEnvelope> templateEnvelopeOptional = templateEnvelopeDao.findByNameIgnoreCase(name.trim());

		if (templateEnvelopeOptional.isPresent()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_TEMPLATE_NAME_ALREADY_EXISTS);
		}

		return new ResponseEntityDto(
				messageUtil.getMessage(EsignMessageConstant.ESIGN_SUCCESS_ENVELOPE_TEMPLATE_NAME_READY_TO_USE), false);

	}

	@Override
	public ResponseEntityDto getEnvelopeTemplates(TemplateEnvelopeFilterDto templateEnvelopeFilterDto) {

		User currentUser = userService.getCurrentUser();

		boolean isSuperAdminOrEsignAdmin = EsignUtil.validateEsignRoleAsSuperAdminOrEsignAdmin(currentUser);

		int pageSize = templateEnvelopeFilterDto.getSize();

		boolean isExport = templateEnvelopeFilterDto.getIsExport();
		if (isExport) {
			pageSize = (int) templateEnvelopeDao.count();
		}

		Pageable pageable = PageRequest.of(templateEnvelopeFilterDto.getPage(), pageSize,
				Sort.by(templateEnvelopeFilterDto.getSortOrder(), templateEnvelopeFilterDto.getSortKey().toString()));

		Page<TemplateEnvelope> templateEnvelopesPage = templateEnvelopeDao.findAllTemplateEnvelopesByFilter(
				templateEnvelopeFilterDto, currentUser.getUserId(), isSuperAdminOrEsignAdmin, pageable);

		List<TemplateEnvelopeResponseDto> mappedItems = templateEnvelopesPage.getContent()
			.stream()
			.map(esignTemplateMapper::templateEnvelopeToTemplateEnvelopeData)
			.toList();

		PageDto pageDto = new PageDto();
		pageDto.setItems(mappedItems);
		pageDto.setCurrentPage(templateEnvelopesPage.getNumber());
		pageDto.setTotalItems(templateEnvelopesPage.getTotalElements());
		pageDto.setTotalPages(templateEnvelopesPage.getTotalPages());

		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	public ResponseEntityDto getEnvelopeTemplateById(Long id) {

		User currentUser = userService.getCurrentUser();

		boolean isSuperAdminOrEsignAdmin = EsignUtil.validateEsignRoleAsSuperAdminOrEsignAdmin(currentUser);

		Optional<TemplateEnvelope> templateEnvelopeOptional = templateEnvelopeDao.findById(id);

		if (templateEnvelopeOptional.isEmpty()) {
			throw new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_TEMPLATE_NOT_FOUND);
		}

		TemplateEnvelope templateEnvelope = templateEnvelopeOptional.get();

		EnvelopeTemplateDetailedResponseDto responseDto = esignTemplateMapper
			.templateEnvelopeToEnvelopeTemplateDetailedResponseDto(templateEnvelope);

		responseDto.getTemplateDocuments().forEach(doc -> {
			doc.setFilePath(EpCommonConstants.HTTPS_PROTOCOL + cloudFrontDomain + "/"
					+ EsignUtil.removeBucketAndEsignPrefix(bucketName, doc.getFilePath()));
		});

		if (!isSuperAdminOrEsignAdmin) {
			if ((templateEnvelope.getOwner().getType().equals(UserType.INTERNAL)
					&& !templateEnvelope.getOwner().getUserId().equals(currentUser.getUserId()))
					|| templateEnvelope.getOwner().getType().equals(UserType.EXTERNAL)) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_TEMPLATE_ACCESS_DENIED);
			}

		}

		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	public ResponseEntityDto deleteEnvelopeTemplate(Long id) {

		User currentUser = userService.getCurrentUser();

		boolean isSuperAdminOrEsignAdmin = EsignUtil.validateEsignRoleAsSuperAdminOrEsignAdmin(currentUser);

		TemplateEnvelope templateEnvelope = templateEnvelopeDao.findById(id)
			.orElseThrow(
					() -> new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_TEMPLATE_NOT_FOUND));

		if (!isSuperAdminOrEsignAdmin && !templateEnvelope.getOwner().getUserId().equals(currentUser.getUserId())) {
			throw new ModuleException(
					EsignMessageConstant.ESIGN_ERROR_ENVELOPE_TEMPLATE_MODIFICATION_AND_DELETION_ACCESS_DENIED);
		}

		templateEnvelope.getTemplateDocuments().forEach(tempDocument -> {
			templateDocumentService.deleteDocumentTemplateFromS3(tempDocument.getFilePath());
		});

		templateEnvelopeDao.delete(templateEnvelope);

		return new ResponseEntityDto(
				messageUtil.getMessage(EsignMessageConstant.ESIGN_SUCCESS_ENVELOPE_TEMPLATE_DELETED), false);

	}

	@Override
	public ResponseEntityDto transferEnvelopeTemplateCustody(Long id,
			EnvelopeTemplateCustodyTransferDto envelopeTemplateCustodyTransferDto) {

		User currentUser = userService.getCurrentUser();

		if (id == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_TEMPLATE_ID_REQUIRED);
		}

		if (envelopeTemplateCustodyTransferDto.getNewOwnerId() == null) {
			throw new ModuleException(
					EsignMessageConstant.ESIGN_ERROR_ENVELOPE_TEMPLATE_CUSTODY_TRANSFER_NEW_OWNER_ID_REQUIRED);
		}

		addressBookDao.findByInternalUser(currentUser)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_USER_NOT_FOUND));

		TemplateEnvelope templateEnvelope = templateEnvelopeDao.findById(id)
			.orElseThrow(
					() -> new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_TEMPLATE_NOT_FOUND));

		boolean isSuperAdminOrEsignAdmin = EsignUtil.validateEsignRoleAsSuperAdminOrEsignAdmin(currentUser);

		if (!isSuperAdminOrEsignAdmin && !templateEnvelope.getOwner().getUserId().equals(currentUser.getUserId())) {
			throw new ModuleException(
					EsignMessageConstant.ESIGN_ERROR_ENVELOPE_TEMPLATE_MODIFICATION_AND_DELETION_ACCESS_DENIED);
		}

		AddressBook newOwner = addressBookDao.findById(envelopeTemplateCustodyTransferDto.getNewOwnerId())
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_USER_NOT_FOUND));

		if (newOwner.getInternalUser() == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_USER_IS_NOT_AN_INTERNAL_USER);

		}

		if (templateEnvelope.getOwner().getId().equals(newOwner.getUserId())) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_USER_ALREADY_OWNER_OF_ENVELOPE_TEMPLATE);
		}

		templateEnvelope.setOwner(newOwner);
		templateEnvelopeDao.save(templateEnvelope);

		return new ResponseEntityDto(
				messageUtil.getMessage(EsignMessageConstant.ESIGN_SUCCESS_ENVELOPE_TEMPLATE_CUSTODY_TRANSFERRED),
				false);
	}

	@Transactional
	@Override
	public ResponseEntityDto editEnvelopeTemplate(Long id,
			TemplateEnvelopeUpdateRequestDto templateEnvelopeUpdateRequestDto) {

		User currentUser = userService.getCurrentUser();

		TemplateEnvelope templateEnvelope = templateEnvelopeDao.findById(id)
			.orElseThrow(
					() -> new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_TEMPLATE_NOT_FOUND));

		List<TemplateDocument> exitingTemplateDocuments = templateEnvelope.getTemplateDocuments();

		boolean isSuperAdminOrEsignAdmin = EsignUtil.validateEsignRoleAsSuperAdminOrEsignAdmin(currentUser);

		if (!isSuperAdminOrEsignAdmin && !templateEnvelope.getOwner().getUserId().equals(currentUser.getUserId())) {
			throw new ModuleException(
					EsignMessageConstant.ESIGN_ERROR_ENVELOPE_TEMPLATE_MODIFICATION_AND_DELETION_ACCESS_DENIED);
		}

		if (templateEnvelopeUpdateRequestDto.getName() != null) {
			validateEnvelopeTemplateName(templateEnvelopeUpdateRequestDto.getName());

			Optional<TemplateEnvelope> templateEnvelopeOptional = templateEnvelopeDao
				.findByNameIgnoreCase(templateEnvelopeUpdateRequestDto.getName().trim());

			if (templateEnvelopeOptional.isPresent()
					&& !templateEnvelopeOptional.get().getId().equals(templateEnvelope.getId())) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_TEMPLATE_NAME_ALREADY_EXISTS);
			}

			templateEnvelope.setName(templateEnvelopeUpdateRequestDto.getName().trim());
		}

		if (templateEnvelopeUpdateRequestDto.getSubject() != null) {
			templateEnvelope.setSubject(templateEnvelopeUpdateRequestDto.getSubject());
		}

		if (templateEnvelopeUpdateRequestDto.getMessage() != null) {
			templateEnvelope.setMessage(templateEnvelopeUpdateRequestDto.getMessage());
		}

		if (templateEnvelopeUpdateRequestDto.getSignType() != null) {
			templateEnvelope.setSignType(templateEnvelopeUpdateRequestDto.getSignType());
		}

		List<TemplateDocument> updatedTemplateDocuments = new ArrayList<>();

		if (templateEnvelopeUpdateRequestDto.getTemplateDocumentIds() != null
				&& templateEnvelopeUpdateRequestDto.getTemplateDocumentIds().isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_TEMPLATE_DOCUMENT_REQUIRED);
		}

		if (templateEnvelopeUpdateRequestDto.getTemplateDocumentIds() != null) {

			List<TemplateDocument> allTemplateDocuments = templateDocumentDao
				.findAllById(templateEnvelopeUpdateRequestDto.getTemplateDocumentIds());

			List<TemplateDocument> alreadyAssignedTemplateDocuments = allTemplateDocuments.stream()
				.filter(doc -> doc.getTemplateEnvelope() != null
						&& !doc.getTemplateEnvelope().getId().equals(templateEnvelope.getId()))
				.toList();

			if (!alreadyAssignedTemplateDocuments.isEmpty()) {
				throw new ModuleException(
						EsignMessageConstant.ESIGN_ERROR_TEMPLATE_DOCUMENT_ALREADY_ASSIGNED_TO_TEMPLATE_ENVELOPE);
			}

			updatedTemplateDocuments = assignTemplateDocumentsToTemplateEnvelope(
					templateEnvelopeUpdateRequestDto.getTemplateDocumentIds(), templateEnvelope, true);

			templateEnvelope.setTemplateDocuments(updatedTemplateDocuments);
		}

		List<Long> documentIds = templateEnvelope.getTemplateDocuments()
			.stream()
			.map(TemplateDocument::getId)
			.collect(Collectors.toList());

		if (templateEnvelopeUpdateRequestDto.getTemplateRecipients() != null) {

			templateRecipientDao.deleteAll(templateEnvelope.getTemplateRecipients());

			if (templateEnvelopeUpdateRequestDto.getTemplateRecipients().isEmpty()) {
				templateEnvelope.setTemplateRecipients(new ArrayList<>());
			}
			else {

				List<TemplateRecipient> templateRecipients = assignTemplateRecipientsToTemplateEnvelope(
						templateEnvelopeUpdateRequestDto.getTemplateRecipients(), templateEnvelope, documentIds);
				templateEnvelope.setTemplateRecipients(templateRecipients);

			}

		}

		if (templateEnvelopeUpdateRequestDto.getTemplateEnvelopeSettingDto() != null) {

			if (templateEnvelope.getTemplateEnvelopeSetting() != null) {
				TemplateEnvelopeSetting templateEnvelopeSetting = templateEnvelope.getTemplateEnvelopeSetting();

				templateEnvelopeSetting.setReminderDays(
						templateEnvelopeUpdateRequestDto.getTemplateEnvelopeSettingDto().getReminderDays());

				templateEnvelope.setTemplateEnvelopeSetting(templateEnvelopeSetting);
			}
			else {
				TemplateEnvelopeSetting templateEnvelopeSetting = buildTemplateEnvelopeSetting(
						templateEnvelopeUpdateRequestDto.getTemplateEnvelopeSettingDto(), templateEnvelope);

				templateEnvelope.setTemplateEnvelopeSetting(templateEnvelopeSetting);
			}
		}

		TemplateEnvelope savedTemplateEnvelope = templateEnvelopeDao.save(templateEnvelope);

		EnvelopeTemplateDetailedResponseDto responseDto = esignTemplateMapper
			.templateEnvelopeToEnvelopeTemplateDetailedResponseDto(savedTemplateEnvelope);

		List<TemplateDocument> currentTemplateDocuments = savedTemplateEnvelope.getTemplateDocuments();

		// Remove only orphaned documents
		if (!currentTemplateDocuments.isEmpty() && !exitingTemplateDocuments.isEmpty()) {
			List<Long> updatedIds = currentTemplateDocuments.stream()
				.map(TemplateDocument::getId)
				.collect(Collectors.toList());

			List<TemplateDocument> orphanedDocs = exitingTemplateDocuments.stream()
				.filter(doc -> !updatedIds.contains(doc.getId()))
				.toList();
			templateDocumentDao.deleteAll(orphanedDocs);
		}

		responseDto.getTemplateDocuments().forEach(doc -> {
			doc.setFilePath(EpCommonConstants.HTTPS_PROTOCOL + cloudFrontDomain + "/"
					+ EsignUtil.removeBucketAndEsignPrefix(bucketName, doc.getFilePath()));
		});

		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	public ResponseEntityDto searchEnvelopeTemplates(String searchKeyword) {

		User currentUser = userService.getCurrentUser();

		boolean showAllTemplates = EsignUtil.validateEsignRoleAsSuperAdminOrEsignAdmin(currentUser);

		List<TemplateEnvelope> templateEnvelopes = new ArrayList<>();

		if (searchKeyword == null) {

			templateEnvelopes = templateEnvelopeDao.findLatestEnvelopeTemplates(currentUser.getUserId(),
					showAllTemplates, ENVELOPE_TEMPLATE_DEFAULT_LIMIT);

		}
		else {

			if (searchKeyword.trim().isEmpty()) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_TEMPLATE_SEARCH_KEYWORD_IS_EMPTY);
			}

			templateEnvelopes = templateEnvelopeDao.findEnvelopeTemplateByName(searchKeyword.trim(), showAllTemplates,
					currentUser.getUserId());
		}

		List<TemplateEnvelopeBasicInfoDto> responseDto = templateEnvelopes.stream()
			.map(esignTemplateMapper::templateEnvelopeToTemplateEnvelopeBasicInfoDto)
			.toList();

		return new ResponseEntityDto(false, responseDto);
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

	private TemplateEnvelope initializeTemplateEnvelope(TemplateEnvelopeDto envelopeTemplateDto) {

		validateEnvelopeTemplateName(envelopeTemplateDto.getName());
		validateEnvelopeTemplateNameExists(envelopeTemplateDto.getName());

		TemplateEnvelope templateEnvelope = new TemplateEnvelope();
		templateEnvelope.setName(envelopeTemplateDto.getName().trim());
		templateEnvelope.setSubject(envelopeTemplateDto.getSubject());
		templateEnvelope.setMessage(envelopeTemplateDto.getMessage());
		templateEnvelope.setSignType(envelopeTemplateDto.getSignType());
		return templateEnvelope;

	}

	private List<TemplateDocument> assignTemplateDocumentsToTemplateEnvelope(List<Long> documentIds,
			TemplateEnvelope templateEnvelope, boolean isUpdate) {

		validateEnvelopeTemplateDocument(documentIds);

		List<TemplateDocument> templateDocuments = templateDocumentDao.findAllById(documentIds);

		if (templateDocuments.size() != documentIds.size()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_TEMPLATE_DOCUMENT_ID_NOT_FOUND);
		}

		if (!isUpdate) {
			// Check if any of the documents already have an envelope
			List<TemplateDocument> alreadyAssignedTemplateDocuments = templateDocuments.stream()
				.filter(doc -> doc.getTemplateEnvelope() != null)
				.toList();

			if (!alreadyAssignedTemplateDocuments.isEmpty()) {
				throw new ModuleException(
						EsignMessageConstant.ESIGN_ERROR_TEMPLATE_DOCUMENT_ALREADY_ASSIGNED_TO_TEMPLATE_ENVELOPE);
			}
		}

		templateDocuments.forEach(doc -> doc.setTemplateEnvelope(templateEnvelope));
		return templateDocuments;

	}

	private List<TemplateRecipient> assignTemplateRecipientsToTemplateEnvelope(List<TemplateRecipientDto> recipients,
			TemplateEnvelope templateEnvelope, List<Long> documentIds) {

		validateEnvelopeTemplateRecipients(recipients, documentIds);

		List<TemplateRecipient> templateRecipients = new ArrayList<>();

		recipients.forEach(templateRecipientDto -> {

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
			templateRecipient
				.setMfaVerificationEnabled(templateRecipientDto.getVerificationType() != EsignVerificationType.NONE);
			templateRecipient.setMfaVerificationMethod(templateRecipientDto.getVerificationType());
			templateRecipient.setTemplateEnvelope(templateEnvelope);

			List<TemplateField> templateFields = new ArrayList<>();

			if (templateRecipientDto.getTemplateFields() != null
					&& !templateRecipientDto.getTemplateFields().isEmpty()) {
				templateFields.addAll(
						buildTemplateFieldsForRecipient(templateRecipientDto.getTemplateFields(), templateRecipient));
			}

			if (templateRecipientDto.getAdvanceTemplateFieldContainers() != null) {
				templateFields.addAll(buildTemplateAdvanceFieldsForRecipient(
						templateRecipientDto.getAdvanceTemplateFieldContainers(), templateRecipient));
			}

			templateRecipient.setTemplateFields(templateFields);

			templateRecipients.add(templateRecipient);
		});

		return templateRecipients;

	}

	private List<TemplateField> buildTemplateFieldsForRecipient(List<TemplateFieldDto> templateFields,
			TemplateRecipient templateRecipient) {

		return templateFields.stream().map(templateFieldDto -> {

			validateFieldDtoConfigurationValues(templateFieldDto);

			TemplateDocument templateFieldDocument = templateDocumentDao
				.findById(templateFieldDto.getTemplateDocumentId())
				.orElseThrow(
						() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_TEMPLATE_DOCUMENT_ID_NOT_FOUND));

			TemplateField templateField = new TemplateField();
			templateField.setType(templateFieldDto.getType());
			templateField.setPageNumber(templateFieldDto.getPageNumber());
			templateField.setXPosition(templateFieldDto.getXPosition());
			templateField.setYPosition(templateFieldDto.getYPosition());
			templateField.setWidth(templateFieldDto.getWidth());
			templateField.setHeight(templateFieldDto.getHeight());
			templateField.setWidthPercentage(templateFieldDto.getWidthPercentage());
			templateField.setHeightPercentage(templateFieldDto.getHeightPercentage());
			templateField.setTemplateDocument(templateFieldDocument);
			templateField.setTemplateRecipient(templateRecipient);

			return templateField;
		}).toList();

	}

	private void validateFieldDtoConfigurationValues(TemplateFieldDto templateFieldDto) {

		if (templateFieldDto.getWidthPercentage() == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FIELD_WIDTH_PERCENTAGE_REQUIRED);
		}

		if (templateFieldDto.getHeightPercentage() == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FIELD_HEIGHT_PERCENTAGE_REQUIRED);
		}

		if (templateFieldDto.getWidthPercentage() <= 0 || templateFieldDto.getWidthPercentage() >= 100) {
			throw new ModuleException(
					EsignMessageConstant.ESIGN_ERROR_FIELD_WIDTH_PERCENTAGE_MUST_BE_BETWEEN_0_AND_100);
		}

		if (templateFieldDto.getHeightPercentage() <= 0 || templateFieldDto.getHeightPercentage() >= 100) {
			throw new ModuleException(
					EsignMessageConstant.ESIGN_ERROR_FIELD_HEIGHT_PERCENTAGE_MUST_BE_BETWEEN_0_AND_100);
		}

		// Validate max 2 decimal places
		BigDecimal widthBD = new BigDecimal(String.valueOf(templateFieldDto.getWidthPercentage()));
		if (widthBD.scale() > 2) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FIELD_WIDTH_PERCENTAGE_MAX_TWO_DECIMAL_PLACES);
		}

		BigDecimal heightBD = new BigDecimal(String.valueOf(templateFieldDto.getHeightPercentage()));
		if (heightBD.scale() > 2) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FIELD_HEIGHT_PERCENTAGE_MAX_TWO_DECIMAL_PLACES);
		}
	}

	private List<TemplateField> buildTemplateAdvanceFieldsForRecipient(
			List<TemplateFieldContainerDto> templateFieldContainerDtos, TemplateRecipient templateRecipient) {

		List<TemplateField> fieldList = new ArrayList<>();
		for (TemplateFieldContainerDto templateFieldContainerDto : templateFieldContainerDtos) {

			validateAdvanceFieldContainerValues(templateFieldContainerDto);

			if (templateFieldContainerDto.getTemplateFields() == null
					|| templateFieldContainerDto.getTemplateFields().isEmpty()) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_AT_LEAST_ONE_FIELD_REQUIRED_FOR_CONTAINER);
			}

			Set<FieldType> fieldTypes = templateFieldContainerDto.getTemplateFields()
				.stream()
				.map(AdvanceTemplateFieldDto::getType)
				.filter(Objects::nonNull)
				.collect(Collectors.toSet());
			if (fieldTypes.size() > 1) {
				throw new ModuleException(
						EsignMessageConstant.ESIGN_ERROR_DIFFERENT_FIELD_TYPES_CANNOT_CONTAIN_IN_THE_SAME_CONTAINER);
			}

			TemplateFieldContainer templateFieldContainer = esignTemplateMapper
				.templateFieldContainerDtoToTemplateFieldContainer(templateFieldContainerDto);

			if (templateFieldContainerDto.getIsRequired() == null) {
				templateFieldContainer.setIsRequired(false);
			}

			if (templateFieldContainerDto.getIsMultiSelect() == null) {
				templateFieldContainer.setIsMultiSelect(false);
			}

			Set<String> existingOptionValue = new HashSet<>();
			Set<Integer> existingDisplayOrder = new HashSet<>();

			if (templateFieldContainerDto.getTemplateFields() == null
					|| templateFieldContainerDto.getTemplateFields().isEmpty()) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_AT_LEAST_ONE_FIELD_REQUIRED_FOR_CONTAINER);
			}

			// Check for RADIO_BUTTON or DROPDOWN fields
			boolean isRadioOrDropdown = templateFieldContainerDto.getTemplateFields()
				.stream()
				.anyMatch(f -> f.getType() == FieldType.RADIO_BUTTON || f.getType() == FieldType.DROPDOWN);

			if (isRadioOrDropdown) {

				long optionCount = templateFieldContainerDto.getTemplateFields()
					.stream()
					.filter(f -> f.getType() == FieldType.RADIO_BUTTON || f.getType() == FieldType.DROPDOWN)
					.map(AdvanceTemplateFieldDto::getFieldOption)
					.filter(Objects::nonNull)
					.distinct()
					.count();

				boolean isRadio = templateFieldContainerDto.getTemplateFields()
					.stream()
					.anyMatch(f -> f.getType() == FieldType.RADIO_BUTTON);

				boolean isDropdown = templateFieldContainerDto.getTemplateFields()
					.stream()
					.anyMatch(f -> f.getType() == FieldType.DROPDOWN);

				if (isRadio && optionCount < 2) {
					throw new ModuleException(
							EsignMessageConstant.ESIGN_ERROR_RADIO_BUTTON_FIELD_MUST_HAVE_AT_LEAST_2_OPTION,
							new String[] { FieldType.RADIO_BUTTON.name() });
				}
				if (isDropdown && optionCount < 1) {
					throw new ModuleException(
							EsignMessageConstant.ESIGN_ERROR_DROPDOWN_FIELD_MUST_HAVE_AT_LEAST_1_OPTION,
							new String[] { FieldType.DROPDOWN.name() });
				}

			}

			for (AdvanceTemplateFieldDto advanceFieldDto : templateFieldContainerDto.getTemplateFields()) {

				EsignValidations.validateEnvelopeFieldMetaData(advanceFieldDto.getWidthPercentage(),
						advanceFieldDto.getHeightPercentage());

				fieldList.add(createAdvanceField(advanceFieldDto, templateRecipient, templateFieldContainer,
						existingOptionValue, existingDisplayOrder));
			}

			templateFieldContainerDao.save(templateFieldContainer);
		}

		return fieldList;
	}

	private TemplateField createAdvanceField(AdvanceTemplateFieldDto advanceFieldDto,
			TemplateRecipient templateRecipient, TemplateFieldContainer templateFieldContainer,
			Set<String> existingOptionValue, Set<Integer> existingDisplayOrder) {
		TemplateDocument templateFieldDocument = templateDocumentDao.findById(advanceFieldDto.getTemplateDocumentId())
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_TEMPLATE_DOCUMENT_ID_NOT_FOUND));
		TemplateField templateField = esignTemplateMapper.advanceTemplateFieldDtoToTemplateField(advanceFieldDto);
		templateField.setHorizontalPadding(
				advanceFieldDto.getHorizontalPadding() != null ? advanceFieldDto.getHorizontalPadding() : 0);
		templateField.setVerticalPadding(
				advanceFieldDto.getVerticalPadding() != null ? advanceFieldDto.getVerticalPadding() : 0);
		templateField
			.setTextLineHeight(advanceFieldDto.getTextLineHeight() != null ? advanceFieldDto.getTextLineHeight() : 0);
		templateField.setTemplateRecipient(templateRecipient);
		templateField.setTemplateDocument(templateFieldDocument);
		templateField.setTemplateFieldContainer(templateFieldContainer);

		if (!isAdvanceFieldTypeWithoutOption(advanceFieldDto.getType())) {
			validateOptionValue(advanceFieldDto, existingOptionValue);
			validateDisplayOrder(advanceFieldDto, existingDisplayOrder);

			TemplateFieldOption templateFieldOption = new TemplateFieldOption();
			templateFieldOption.setOptionValue(advanceFieldDto.getFieldOption().getOptionValue().trim());
			templateFieldOption.setDisplayOrder(advanceFieldDto.getFieldOption().getDisplayOrder());
			templateField.setTemplateFieldOption(templateFieldOption);
		}

		return templateField;
	}

	private boolean isAdvanceFieldTypeWithoutOption(FieldType type) {
		return FieldType.TEXT.equals(type) || FieldType.CHECKBOX.equals(type);
	}

	private void validateOptionValue(AdvanceTemplateFieldDto templateFieldDto, Set<String> existingOptionValue) {
		String value = templateFieldDto.getFieldOption().getOptionValue();
		if (value == null || value.trim().isBlank()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FIELD_OPTION_VALUE_REQUIRED);
		}
		if (value.trim().length() > EsignConstants.MAX_ADVANCED_FIELD_OPTION_VALUE_LENGTH) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FIELD_OPTION_VALUE_EXCEEDS_MAX_LENGTH);
		}
		if (!existingOptionValue.add(value.trim())) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FIELD_OPTION_VALUE_MUST_BE_UNIQUE);
		}
	}

	private void validateDisplayOrder(AdvanceTemplateFieldDto templateFieldDto, Set<Integer> existingDisplayOrder) {
		Integer displayOrder = templateFieldDto.getFieldOption().getDisplayOrder();
		if (displayOrder != null && displayOrder <= 0) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FIELD_OPTION_VALID_DISPLAY_ORDER_REQUIRED);
		}
		if (displayOrder != null && !existingDisplayOrder.add(displayOrder)) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FIELD_OPTION_DISPLAY_ORDER_MUST_BE_UNIQUE);
		}
	}

	private void validateAdvanceFieldContainerValues(TemplateFieldContainerDto templateFieldContainerDto) {

		if (templateFieldContainerDto.getTemplateFields() == null
				|| templateFieldContainerDto.getTemplateFields().isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_AT_LEAST_ONE_FIELD_REQUIRED_FOR_CONTAINER);
		}

		if (templateFieldContainerDto.getFontFamily() == null || templateFieldContainerDto.getFontFamily().isBlank()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FONT_FAMILY_REQUIRED_FOR_CONTAINER);
		}

		if (templateFieldContainerDto.getFontColor() == null || templateFieldContainerDto.getFontColor().isBlank()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FONT_COLOR_REQUIRED_FOR_CONTAINER);
		}

		if (templateFieldContainerDto.getFontSize() == null || templateFieldContainerDto.getFontSize() <= 0) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FONT_SIZE_REQUIRED_FOR_CONTAINER);
		}

	}

	private TemplateEnvelopeSetting buildTemplateEnvelopeSetting(TemplateEnvelopeSettingDto templateEnvelopeSettingDto,
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

		if (envelopeTemplateName.trim().length() > ENVELOPE_TEMPLATE_NAME_MAX_LENGTH) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_TEMPLATE_NAME_MAX_LENGTH_EXCEEDED);
		}

	}

	private void validateEnvelopeTemplateNameExists(String envelopeTemplateName) {

		Optional<TemplateEnvelope> templateEnvelopeOptional = templateEnvelopeDao
			.findByNameIgnoreCase(envelopeTemplateName.trim());

		if (templateEnvelopeOptional.isPresent()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_TEMPLATE_NAME_ALREADY_EXISTS);
		}

	}

	private void validateEnvelopeTemplateDocument(List<Long> documentIds) {

		if (documentIds == null || documentIds.isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_TEMPLATE_DOCUMENT_REQUIRED);
		}

		List<Long> ids = documentIds.stream().filter(Objects::nonNull).distinct().toList();

		if (ids.isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_TEMPLATE_DOCUMENT_REQUIRED);
		}

		if (documentIds.size() > ENVELOPE_TEMPLATE_MAX_DOCUMENT_COUNT) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_TEMPLATE_DOCUMENT_MAX_LIMIT_EXCEEDED);
		}

	}

	private void validateEnvelopeTemplateRecipients(List<TemplateRecipientDto> recipientTemplates,
			List<Long> documentIds) {

		if (recipientTemplates == null || recipientTemplates.isEmpty()) {
			throw new ModuleException(
					EsignMessageConstant.ESIGN_ERROR_ENVELOPE_TEMPLATE_LEAST_ONE_RECIPIENTS_ROLE_REQUIRED);
		}

		// Validate recipient roles
		boolean hasNoRecipientRole = recipientTemplates.stream()
			.anyMatch(
					recipient -> recipient.getRecipientRole() == null || recipient.getRecipientRole().trim().isEmpty());
		if (hasNoRecipientRole) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_TEMPLATE_RECIPIENT_ROLE_REQUIRED);
		}

		boolean exceedMaxRecipientRoleLength = recipientTemplates.stream()
			.map(TemplateRecipientDto::getRecipientRole)
			.filter(Objects::nonNull)
			.map(String::trim)
			.anyMatch(role -> role.length() > ENVELOPE_TEMPLATE_MAX_RECIPIENT_ROLE_LENGTH);
		if (exceedMaxRecipientRoleLength) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_TEMPLATE_RECIPIENT_ROLE_MAX_LENGTH_EXCEEDED);
		}

		boolean duplicateRecipientRole = recipientTemplates.stream()
			.map(TemplateRecipientDto::getRecipientRole)
			.filter(Objects::nonNull)
			.map(String::toLowerCase)
			.distinct()
			.count() < recipientTemplates.stream()
				.map(TemplateRecipientDto::getRecipientRole)
				.filter(Objects::nonNull)
				.count();
		if (duplicateRecipientRole) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_TEMPLATE_RECIPIENT_ROLE_DUPLICATED);
		}

		// Validate fields for all recipients
		for (TemplateRecipientDto recipient : recipientTemplates) {
			List<TemplateFieldDto> fields = recipient.getTemplateFields();
			if (fields != null && !fields.isEmpty()) {
				for (TemplateFieldDto field : fields) {
					if (field.getTemplateDocumentId() == null) {
						throw new ModuleException(
								EsignMessageConstant.ESIGN_ERROR_TEMPLATE_RECIPIENT_FIELD_DOCUMENT_ID_REQUIRED);
					}
					if (!documentIds.contains(field.getTemplateDocumentId())) {
						throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_INVALID_TEMPLATE_DOCUMENT_ID);
					}
				}
			}
		}

	}

}
