package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.service.AmazonS3Service;
import com.skapp.enterprise.common.service.ScheduleService;
import com.skapp.enterprise.common.type.QuartzEntityType;
import com.skapp.enterprise.common.util.HashUtil;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.mapper.EsignMapper;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.AuditTrail;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.DocumentLink;
import com.skapp.enterprise.esignature.model.DocumentSignature;
import com.skapp.enterprise.esignature.model.DocumentVersion;
import com.skapp.enterprise.esignature.model.DocumentVersionField;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Field;
import com.skapp.enterprise.esignature.model.FieldContainer;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.model.UserKey;
import com.skapp.enterprise.esignature.payload.request.DocumentDto;
import com.skapp.enterprise.esignature.payload.request.DocumentFieldSignDto;
import com.skapp.enterprise.esignature.payload.request.DocumentAccessUrlDto;
import com.skapp.enterprise.esignature.payload.request.DocumentPdfConvertFilterRequestDto;
import com.skapp.enterprise.esignature.payload.request.DocumentSignDto;
import com.skapp.enterprise.esignature.payload.request.EditDocumentDto;
import com.skapp.enterprise.esignature.payload.request.FieldSignDto;
import com.skapp.enterprise.esignature.payload.response.DocumentCompleteResponseDto;
import com.skapp.enterprise.esignature.payload.response.DocumentDetailResponseDto;
import com.skapp.enterprise.esignature.payload.response.DocumentPdfConvertMetaResponseDto;
import com.skapp.enterprise.esignature.payload.response.PageDimensionResponseDto;
import com.skapp.enterprise.esignature.payload.response.SignedDocumentResponse;
import com.skapp.enterprise.esignature.repository.AddressBookDao;
import com.skapp.enterprise.esignature.repository.AuditTrailDao;
import com.skapp.enterprise.esignature.repository.DocumentRepository;
import com.skapp.enterprise.esignature.repository.DocumentLinkRepository;
import com.skapp.enterprise.esignature.repository.DocumentVersionDao;
import com.skapp.enterprise.esignature.repository.DocumentVersionFieldRepository;
import com.skapp.enterprise.esignature.repository.EnvelopeDao;
import com.skapp.enterprise.esignature.repository.FieldRepository;
import com.skapp.enterprise.esignature.repository.RecipientDao;
import com.skapp.enterprise.esignature.security.AESKeyLoader;
import com.skapp.enterprise.esignature.service.AuditTrailService;
import com.skapp.enterprise.esignature.service.DocumentLinkService;
import com.skapp.enterprise.esignature.service.DocumentProcessingService;
import com.skapp.enterprise.esignature.service.DocumentService;
import com.skapp.enterprise.esignature.service.EsignNotificationService;
import com.skapp.enterprise.esignature.service.PdfSigningService;
import com.skapp.enterprise.esignature.service.RecipientService;
import com.skapp.enterprise.esignature.service.SignatureCertificateService;
import com.skapp.enterprise.esignature.service.UserKeyService;
import com.skapp.enterprise.esignature.type.AuditAction;
import com.skapp.enterprise.esignature.type.DocumentPermissionType;
import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import com.skapp.enterprise.esignature.type.FieldStatus;
import com.skapp.enterprise.esignature.type.FieldType;
import com.skapp.enterprise.esignature.type.InboxStatus;
import com.skapp.enterprise.esignature.type.MemberRole;
import com.skapp.enterprise.esignature.type.RecipientStatus;
import com.skapp.enterprise.esignature.type.SignType;
import com.skapp.enterprise.esignature.util.EsignUtil;
import com.skapp.enterprise.esignature.util.decryptor.AESDecrypt;
import jakarta.persistence.PessimisticLockException;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.bouncycastle.jcajce.provider.digest.SHA3;
import org.hibernate.exception.LockAcquisitionException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.CannotAcquireLockException;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.MessageDigest;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

import com.skapp.enterprise.esignature.payload.response.SignedPdfResult;
import com.skapp.enterprise.common.payload.request.AmazonS3DeleteItemRequestDto;

import static com.skapp.community.common.util.DateTimeUtils.getCurrentUtcDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

	private static final int BUFFER_SIZE = 8192; // 8KB buffer

	private static final String SIGNATURE_ALGORITHM = "SHA3-256withECDSA";

	private static final String KEY_ALGORITHM = "EC";

	private static final String SECURITY_PROVIDER = "BC";

	public static final String SKAPP_SIGN_ENVELOPE_TEXT = "Skapp Sign Envelope ID: ";

	public static final String UPLOAD_DOCUMENT_URL_PATH = "/eSign/envelop/process/documents/";

	private final DocumentRepository documentRepository;

	private final DocumentLinkRepository documentLinkRepository;

	private final AddressBookDao addressBookDao;

	private final DocumentVersionDao documentVersionDao;

	private final DocumentVersionFieldRepository documentVersionFieldRepository;

	private final EnvelopeDao envelopeDao;

	private final AuditTrailDao auditTrailDao;

	private final UserKeyService userKeyService;

	private final AmazonS3Service amazonS3Service;

	private final DocumentProcessingService documentProcessingService;

	private final RecipientService recipientService;

	private final EsignNotificationService esignNotificationService;

	private final FieldRepository fieldRepository;

	private final EsignMapper eSignMapper;

	private final AESKeyLoader aesKeyLoader;

	private final DocumentLinkService documentLinkService;

	private final AuditTrailService auditTrailService;

	private final ScheduleService scheduleService;

	private final Optional<PdfSigningService> pdfSigningService;

	private final SignatureCertificateService signatureCertificateService;

	private final RecipientDao recipientDao;

	@Value("${aws.s3.bucket-name}")
	private String bucketName;

	@Value("${aws.s3.max-attempts}")
	private int s3MaxAttempts;

	@Getter
	@Value("${retry.max-attempts}")
	private int retryMaxAttempts;

	@Getter
	@Value("${retry.backoff-delay}")
	private Long retryBackoffDelay;

	@Value("${aws.cloudfront.s3-default.domain-name}")
	private String cloudFrontDomain;

	@Override
	public ResponseEntityDto saveDocument(DocumentDto documentDto) {
		Document document = eSignMapper.documentDtoToDocument(documentDto);
		document.setFilePath(bucketName + "/" + document.getFilePath());
		document = documentRepository.save(document);
		DocumentDetailResponseDto documentResponseDto = eSignMapper.documentToDocumentDetailDto(document);
		return new ResponseEntityDto(false, documentResponseDto);
	}

	@Override
	public Document getDocumentById(Long id) {
		return documentRepository.findById(id)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_NOT_FOUND));
	}

	@Override
	@Transactional
	public SignedDocumentResponse signFirstVersionDocument(Envelope envelope, DocumentSignDto documentSignDto,
			String uuid) {
		try {

			KeyPair keyPair = loadKeyPair(envelope.getOwner().getId());

			Document document = documentRepository.findById(documentSignDto.getDocumentId())
				.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_NOT_FOUND));

			DocumentVersion currentVersion = getDocumentVersionObj(document);

			byte[] documentBytes = amazonS3Service.downloadFileAsBytes(bucketName, currentVersion.getFilePath());

			int numberOfPages = documentProcessingService.getNumberOfPages(documentBytes);

			String value = SKAPP_SIGN_ENVELOPE_TEXT + uuid;

			byte[] updatedDoc = updateEnvelopeUuidInDocument(value, documentBytes, numberOfPages);

			String fileUrl = uploadProcessedDocumentVersion(updatedDoc);

			DocumentVersion newDocumentVersion = createNewDocumentVersion(documentSignDto, currentVersion, fileUrl,
					keyPair.getPrivate(), envelope.getOwner(), updatedDoc);

			return new SignedDocumentResponse(newDocumentVersion, numberOfPages);
		}
		catch (Exception e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_SIGN_DOCUMENT,
					new String[] { e.getMessage() });
		}
	}

	@Override
	@Transactional
	public ResponseEntityDto sequentialSignDocument(DocumentSignDto documentSignDto, boolean isDocAccess,
			String ipAddress) {

		validateDocumentSignRequest(documentSignDto);

		String username = getCurrentUsername();

		if (username == null) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}

		AddressBook currentAddressBookUser = getCurrentAddressBookUser(username);

		if (currentAddressBookUser == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_USER_NOT_FOUND);
		}

		Document document = documentRepository.findById(documentSignDto.getDocumentId())
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_NOT_FOUND));

		if (!document.getEnvelope().getId().equals(documentSignDto.getEnvelopeId())) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_INVALID_ENVELOPE_ID);
		}

		Recipient recipient = getRecipientById(documentSignDto.getRecipientId());

		documentLinkService.validateTokenFlows(isDocAccess, recipient, documentSignDto.getDocumentId());

		if (recipient.getMemberRole().equals(MemberRole.CC)) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_CC_RECIPIENT_CANNOT_SIGN);
		}

		if (!recipient.getStatus().equals(RecipientStatus.NEED_TO_SIGN)) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_DOCUMENT_SIGN_COMPLETED);
		}

		if (!recipient.getAddressBook().getId().equals(currentAddressBookUser.getId())) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_CURRENT_USER_NOT_MATCH);
		}

		if (document.getCurrentSignOderNumber() != recipient.getSigningOrder()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_INVALID_SIGN_ORDER_RECIPIENT);
		}

		if (recipient.requiresEidVerification() && !recipient.isEidVerificationComplete()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_EID_VERIFICATION_REQUIRED);
		}

		DocumentVersion currentVersion = getDocumentVersion(document.getCurrentVersion(),
				documentSignDto.getDocumentId());

		// Load and validate keys-load previous user keys
		KeyPair keyPairVerify = loadKeyPair(currentVersion.getAddressBook().getId());
		// current user key pair for sign document
		KeyPair keyPairSign = loadKeyPair(currentAddressBookUser.getId());

		byte[] documentBytes = amazonS3Service.downloadFileAsBytes(bucketName, currentVersion.getFilePath());

		// Process document version and verify existing signature
		verifyDocumentSignature(documentBytes, currentVersion, keyPairVerify.getPublic());

		if (documentSignDto.getFieldSignDtoList() != null && !documentSignDto.getFieldSignDtoList().isEmpty()) {

			DocumentVersionFieldBulk result = processDocumentFields(documentSignDto, currentVersion);

			documentVersionFieldRepository.saveAll(result.documentVersionFields());
			fieldRepository.saveAll(result.fields());
		}

		boolean hasEmptyFields = recipient.getFields()
			.stream()
			.anyMatch(field -> field.getStatus().equals(FieldStatus.EMPTY));

		if (hasEmptyFields) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ALL_FIELDS_NEED_SIGN);
		}

		recipient.setStatus(RecipientStatus.COMPLETED);
		recipient.setInboxStatus(InboxStatus.WAITING);
		recipientDao.save(recipient);

		byte[] updatedDocumentBytes = mergeAllFieldsToDocument(currentVersion, documentBytes);

		String fileUrl = uploadProcessedDocumentVersion(updatedDocumentBytes);

		// Create new version with signature
		DocumentVersion newVersion = createNewDocumentVersion(documentSignDto, currentVersion, fileUrl,
				keyPairSign.getPrivate(), currentAddressBookUser, updatedDocumentBytes);

		newVersion = documentVersionDao.save(newVersion);

		// save document on current version
		document.setCurrentVersion(newVersion.getVersionNumber());

		List<Recipient> nextSignRecipientList = recipientService
			.getNextSignRecipientData(Optional.ofNullable(recipient.getId()), document.getEnvelope().getId());

		if (isDocumentComplete(nextSignRecipientList)) {
			return completeDocument(document, newVersion, updatedDocumentBytes, recipient, ipAddress, isDocAccess);
		}

		// Prepare document links and recipient metadata (no emails sent yet)
		RecipientService.DocumentLinksAndRecipientsData nextRecipientsData = recipientService
			.prepareNextRecipients(nextSignRecipientList, document);

		List<Recipient> updatedRecipients = nextRecipientsData.recipientList();

		documentLinkRepository.saveAll(nextRecipientsData.documentLinkList());

		Map<Long, String> nextRecipientAccessUrls = nextRecipientsData.recipientAccessUrls();

		for (Recipient rec : updatedRecipients) {
			rec.setReceivedAt(getCurrentUtcDateTime());

			if (rec.getMemberRole().equals(MemberRole.CC)) {
				rec.setStatus(RecipientStatus.COMPLETED);
				rec.setInboxStatus(InboxStatus.WAITING);
			}
			else {
				document.setCurrentSignOderNumber(rec.getSigningOrder());
				rec.setStatus(RecipientStatus.NEED_TO_SIGN);
				rec.setInboxStatus(InboxStatus.NEED_TO_SIGN);
			}
		}

		document = documentRepository.save(document);
		recipientDao.saveAll(updatedRecipients);

		esignNotificationService.notifyEnvelopeOwnerOnDocumentCompleted(document.getEnvelope(), recipient);

		AuditTrail auditTrail = auditTrailService.processAuditTrailInfo(document.getEnvelope(), recipient,
				AuditAction.ENVELOPE_SIGNED, null, ipAddress, null);
		auditTrailDao.save(auditTrail);

		recipientService.cancelEmailReminders(recipient.getId(), document.getEnvelope().getId());

		Long sequentialEnvelopeId = document.getEnvelope().getId();

		// Send emails to next recipients only after transaction commits
		TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
			@Override
			public void afterCommit() {
				recipientService.sendEnvelopeEmailNotifications(sequentialEnvelopeId, nextRecipientAccessUrls);
			}
		});

		DocumentCompleteResponseDto documentCompleteResponseDto = new DocumentCompleteResponseDto();
		documentCompleteResponseDto.setStatus(document.getEnvelope().getStatus());

		documentCompleteResponseDto.setAccessLink(EpCommonConstants.HTTPS_PROTOCOL + cloudFrontDomain + "/"
				+ EsignUtil.removeBucketAndEsignPrefix(bucketName, newVersion.getFilePath()));

		return new ResponseEntityDto(false, documentCompleteResponseDto);
	}

	private ResponseEntityDto completeDocument(Document document, DocumentVersion newVersion,
			byte[] latestDocumentBytes, Recipient recipient, String ipAddress, boolean isDocAccess) {
		DocumentVersion documentVersion = verifyDocumentVersionsRelatedToDocument(document, newVersion,
				latestDocumentBytes);
		documentVersionDao.save(documentVersion);

		document.setCurrentVersion(documentVersion.getVersionNumber());
		documentRepository.save(document);

		Envelope envelope = document.getEnvelope();
		envelope.setStatus(EnvelopeStatus.COMPLETED);
		envelope.setCompletedAt(getCurrentUtcDateTime());
		envelopeDao.save(envelope);

		esignNotificationService.notifyEnvelopeOwnerOnDocumentCompleted(envelope, recipient);

		envelope.getRecipients().forEach(rec -> rec.setInboxStatus(InboxStatus.COMPLETED));

		List<AuditTrail> auditTrails = new ArrayList<>();

		AuditTrail auditTrailRecipient = auditTrailService.processAuditTrailInfo(document.getEnvelope(), recipient,
				AuditAction.ENVELOPE_SIGNED, null, ipAddress, null);
		auditTrails.add(auditTrailRecipient);

		AuditTrail auditTrail = auditTrailService.processAuditTrailInfo(envelope, null, AuditAction.ENVELOPE_COMPLETED,
				null, null, null);
		auditTrails.add(auditTrail);

		auditTrailDao.saveAll(auditTrails);

		byte[] processedDocumentBytes = appendCertificateToBytes(envelope, documentVersion, latestDocumentBytes,
				isDocAccess);

		// Sign the processed PDF (if signing is enabled via feature flag)
		// This will sign the document WITH the appended certificate
		String finalDocumentPath = signAndUploadDocument(documentVersion, processedDocumentBytes);

		// Update document version with final file path
		if (finalDocumentPath != null) {
			documentVersion.setFilePath(finalDocumentPath);
			documentVersionDao.save(documentVersion);
		}

		recipientDao.saveAll(envelope.getRecipients());

		// Create and persist document links within this transaction so they are
		// committed before any emails are sent
		List<DocumentLink> documentLinkList = new ArrayList<>();
		Map<Long, String> recipientAccessUrls = new HashMap<>();
		Document envelopeDocument = envelope.getDocuments().getFirst();

		for (Recipient mailRecipient : envelope.getRecipients()) {
			DocumentAccessUrlDto documentAccessUrlDto = new DocumentAccessUrlDto(envelopeDocument.getId(),
					mailRecipient.getId(), DocumentPermissionType.READ);

			DocumentLinkService.DocumentLinkData documentLinkData = documentLinkService
				.createDocumentLinkData(documentAccessUrlDto, mailRecipient, envelopeDocument, envelope);

			documentLinkList.add(documentLinkData.documentLink());
			recipientAccessUrls.put(mailRecipient.getId(), documentLinkData.accessUrl());
		}

		documentLinkRepository.saveAll(documentLinkList);

		DocumentCompleteResponseDto documentCompleteResponseDto = new DocumentCompleteResponseDto();
		documentCompleteResponseDto.setStatus(document.getEnvelope().getStatus());
		documentCompleteResponseDto.setAccessLink(EpCommonConstants.HTTPS_PROTOCOL + cloudFrontDomain + "/"
				+ EsignUtil.removeBucketAndEsignPrefix(bucketName, documentVersion.getFilePath()));

		Long completedEnvelopeId = envelope.getId();
		TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
			@Override
			public void afterCommit() {
				String tenantId = TenantContext.getCurrentTenant();
				scheduleService.unScheduleExpiration(completedEnvelopeId, tenantId, QuartzEntityType.ENVELOPE);
				scheduleService.unScheduleExpiration(completedEnvelopeId, tenantId,
						QuartzEntityType.ENVELOPE_EXPIRATION_REMINDER);
				recipientService.sendDocumentCompletedEmailNotifications(completedEnvelopeId, recipientAccessUrls);
			}

			@Override
			public void afterCompletion(int status) {
				if (status == TransactionSynchronization.STATUS_ROLLED_BACK && finalDocumentPath != null) {
					log.warn("Transaction rolled back. Deleting orphaned S3 file: {}", finalDocumentPath);
					try {
						AmazonS3DeleteItemRequestDto deleteRequest = new AmazonS3DeleteItemRequestDto();
						deleteRequest.setFolderPath(finalDocumentPath);
						amazonS3Service.deleteFileFromS3(deleteRequest);
					}
					catch (Exception e) {
						log.error("Failed to delete orphaned S3 file: " + finalDocumentPath, e);
					}
				}
			}
		});

		return new ResponseEntityDto(false, documentCompleteResponseDto);
	}

	@Retryable(
			retryFor = { CannotAcquireLockException.class, PessimisticLockException.class,
					LockAcquisitionException.class },
			maxAttemptsExpression = "#{@documentServiceImpl.retryMaxAttempts}",
			backoff = @Backoff(delayExpression = "#{@documentServiceImpl.retryBackoffDelay}"))
	@Override
	@Transactional
	public ResponseEntityDto parallelSignDocument(DocumentSignDto documentSignDto, boolean isDocAccess,
			String ipAddress) {

		validateDocumentSignRequest(documentSignDto);

		String username = getCurrentUsername();

		if (username == null) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}

		AddressBook currentAddressBookUser = getCurrentAddressBookUser(username);

		if (currentAddressBookUser == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_USER_NOT_FOUND);
		}

		Recipient recipient = getRecipientById(documentSignDto.getRecipientId());

		documentLinkService.validateTokenFlows(isDocAccess, recipient, documentSignDto.getDocumentId());

		if (recipient.getMemberRole().equals(MemberRole.CC)) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_CC_RECIPIENT_CANNOT_SIGN);
		}

		if (!recipient.getStatus().equals(RecipientStatus.NEED_TO_SIGN)) {
			if (recipient.getInboxStatus().equals(InboxStatus.DECLINED)) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_ALREADY_DECLINED);
			}
			else {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_DOCUMENT_SIGN_COMPLETED);
			}
		}

		if (!recipient.getAddressBook().getId().equals(currentAddressBookUser.getId())) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_CURRENT_USER_NOT_MATCH);
		}

		Document document = documentRepository.findById(documentSignDto.getDocumentId())
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_NOT_FOUND));

		if (!document.getEnvelope().getId().equals(documentSignDto.getEnvelopeId())) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_INVALID_ENVELOPE_ID);
		}

		if (recipient.requiresEidVerification() && !recipient.isEidVerificationComplete()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_EID_VERIFICATION_REQUIRED);
		}

		DocumentVersion currentVersion = getDocumentVersionForUpdate(document.getCurrentVersion(), document.getId());

		LatestDocumentData latestDocumentData = downloadLatestDocumentBytes(document, currentVersion);
		byte[] documentBytes = latestDocumentData.fileBytes();

		DocumentVersion usedVersion = latestDocumentData.documentVersion();

		KeyPair keyPairVerify = loadKeyPair(usedVersion.getAddressBook().getId());
		verifyDocumentSignature(documentBytes, usedVersion, keyPairVerify.getPublic());

		KeyPair keyPairSign = loadKeyPair(currentAddressBookUser.getId());

		if (!CollectionUtils.isEmpty(documentSignDto.getFieldSignDtoList())) {
			DocumentVersionFieldBulk result = processFieldLevelSign(documentSignDto, keyPairSign.getPrivate(),
					currentVersion);

			documentVersionFieldRepository.saveAll(result.documentVersionFields());
			fieldRepository.saveAll(result.fields());
		}

		boolean hasEmptyFields = recipient.getFields()
			.stream()
			.anyMatch(field -> field.getStatus().equals(FieldStatus.EMPTY));

		if (hasEmptyFields) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ALL_FIELDS_NEED_SIGN);
		}

		recipient.setStatus(RecipientStatus.COMPLETED);
		recipient.setInboxStatus(InboxStatus.WAITING);
		recipientDao.save(recipient);

		List<Long> fieldIdList = recipient.getFields().stream().map(Field::getId).toList();

		List<DocumentVersionField> fieldVersionList = documentVersionFieldRepository.findByField_IdIn(fieldIdList);

		byte[] updatedDocumentBytes = mergeFieldsToLatestDocument(fieldVersionList, documentBytes, keyPairSign);

		String fileUrl = uploadProcessedDocumentVersion(updatedDocumentBytes);

		// Create new version with signature
		DocumentVersion newVersion = createNewDocumentVersion(documentSignDto, currentVersion, fileUrl,
				keyPairSign.getPrivate(), currentAddressBookUser, updatedDocumentBytes);

		documentVersionDao.save(newVersion);

		document.setCurrentVersion(newVersion.getVersionNumber());
		documentRepository.save(document);

		recipientService.cancelEmailReminders(recipient.getId(), document.getEnvelope().getId());

		esignNotificationService.notifyEnvelopeOwnerOnDocumentCompleted(document.getEnvelope(), recipient);

		DocumentCompleteResponseDto documentCompleteResponseDto = new DocumentCompleteResponseDto();

		// Process complete document if all recipients have completed
		if (!hasNonWaitingRecipient(document.getEnvelope().getId())) {
			// Get first version of document
			DocumentVersion firstDocumentVersion = getDocumentVersion(1, document.getId());

			byte[] initialDocumentBytes = amazonS3Service.downloadFileAsBytes(bucketName,
					firstDocumentVersion.getFilePath());
			KeyPair keyPairSender = loadKeyPair(document.getEnvelope().getOwner().getId());

			verifyDocumentSignature(initialDocumentBytes, firstDocumentVersion, keyPairSender.getPublic());

			byte[] fullDocumentBytes = mergeAllFieldsToFinalDocument(document, initialDocumentBytes);

			// Create final version with all signatures
			String completeFileUrl = uploadProcessedDocumentVersion(fullDocumentBytes);

			DocumentVersion finalVersion = signFinalDocumentVersionBySender(document, fullDocumentBytes,
					completeFileUrl, keyPairSender);

			documentVersionDao.save(finalVersion);

			document.setCurrentVersion(finalVersion.getVersionNumber());
			documentRepository.save(document);
			Envelope envelope = document.getEnvelope();
			envelope.setStatus(EnvelopeStatus.COMPLETED);
			envelope.setCompletedAt(getCurrentUtcDateTime());
			envelopeDao.save(envelope);

			List<AuditTrail> auditTrails = new ArrayList<>();

			AuditTrail auditTrailRecipient = auditTrailService.processAuditTrailInfo(document.getEnvelope(), recipient,
					AuditAction.ENVELOPE_SIGNED, null, ipAddress, null);
			auditTrails.add(auditTrailRecipient);

			AuditTrail auditTrail = auditTrailService.processAuditTrailInfo(envelope, null,
					AuditAction.ENVELOPE_COMPLETED, null, null, null);
			auditTrails.add(auditTrail);

			auditTrailDao.saveAll(auditTrails);

			byte[] processedDocumentBytes = appendCertificateToBytes(envelope, finalVersion, fullDocumentBytes,
					isDocAccess);

			// Sign the processed PDF (if signing is enabled via feature flag)
			// This will sign the document WITH the appended certificate
			String finalDocumentPath = signAndUploadDocument(finalVersion, processedDocumentBytes);

			// Update document version with final file path
			if (finalDocumentPath != null) {
				finalVersion.setFilePath(finalDocumentPath);
			}
			documentVersionDao.save(finalVersion);

			// Update all recipients
			List<Recipient> recipients = envelope.getRecipients();
			recipients.forEach(rec -> rec.setInboxStatus(InboxStatus.COMPLETED));
			recipientDao.saveAll(recipients);

			// Create and persist document links within this transaction
			List<DocumentLink> parallelDocumentLinkList = new ArrayList<>();
			Map<Long, String> parallelRecipientAccessUrls = new HashMap<>();
			Document parallelEnvelopeDocument = envelope.getDocuments().getFirst();

			for (Recipient mailRecipient : envelope.getRecipients()) {
				DocumentAccessUrlDto parallelDocAccessUrlDto = new DocumentAccessUrlDto(
						parallelEnvelopeDocument.getId(), mailRecipient.getId(), DocumentPermissionType.READ);

				DocumentLinkService.DocumentLinkData parallelDocLinkData = documentLinkService
					.createDocumentLinkData(parallelDocAccessUrlDto, mailRecipient, parallelEnvelopeDocument, envelope);

				parallelDocumentLinkList.add(parallelDocLinkData.documentLink());
				parallelRecipientAccessUrls.put(mailRecipient.getId(), parallelDocLinkData.accessUrl());
			}

			documentLinkRepository.saveAll(parallelDocumentLinkList);

			documentCompleteResponseDto.setStatus(envelope.getStatus());
			documentCompleteResponseDto.setAccessLink(EpCommonConstants.HTTPS_PROTOCOL + cloudFrontDomain + "/"
					+ EsignUtil.removeBucketAndEsignPrefix(bucketName, finalVersion.getFilePath()));

			Long parallelEnvelopeId = envelope.getId();
			TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
				@Override
				public void afterCommit() {
					String tenantId = TenantContext.getCurrentTenant();
					scheduleService.unScheduleExpiration(parallelEnvelopeId, tenantId, QuartzEntityType.ENVELOPE);
					scheduleService.unScheduleExpiration(parallelEnvelopeId, tenantId,
							QuartzEntityType.ENVELOPE_EXPIRATION_REMINDER);
					recipientService.sendDocumentCompletedEmailNotifications(parallelEnvelopeId,
							parallelRecipientAccessUrls);
				}
			});

			return new ResponseEntityDto(false, documentCompleteResponseDto);
		}

		AuditTrail auditTrail = auditTrailService.processAuditTrailInfo(document.getEnvelope(), recipient,
				AuditAction.ENVELOPE_SIGNED, null, ipAddress, null);
		auditTrailDao.save(auditTrail);

		documentCompleteResponseDto.setStatus(document.getEnvelope().getStatus());
		documentCompleteResponseDto.setAccessLink(EpCommonConstants.HTTPS_PROTOCOL + cloudFrontDomain + "/"
				+ EsignUtil.removeBucketAndEsignPrefix(bucketName, newVersion.getFilePath()));

		return new ResponseEntityDto(false, documentCompleteResponseDto);
	}

	/**
	 * Signs the document bytes (if signing is enabled) and uploads to S3. This method is
	 * designed to work with certificate-appended bytes when that feature is merged.
	 * @param documentVersion The document version to update with signature metadata
	 * @param documentBytes The document bytes to sign (can be original or with appended
	 * certificate)
	 * @return The S3 path of the uploaded document, or null if upload failed
	 */
	private String signAndUploadDocument(DocumentVersion documentVersion, byte[] documentBytes) {
		Optional<SignedPdfResult> signedResult = signCompletedPdf(documentVersion, documentBytes);

		return signedResult.map(result -> {
			// Upload signed PDF to S3
			String path = uploadProcessedDocumentVersion(result.getSignedPdfBytes());

			// Update document version with signature metadata
			documentVersion.setIsPdfSigned(true);
			documentVersion.setPdfSignedAt(getCurrentUtcDateTime());
			documentVersion.setCertificateSerialNumber(result.getCertificateSerialNumber());
			documentVersion.setSignatureAlgorithm(result.getSignatureAlgorithm());

			log.info("PDF signed successfully for document version: {}", documentVersion.getId());
			return path;
		}).orElseGet(() -> {
			// Signing disabled or failed - upload unsigned document
			String path = uploadProcessedDocumentVersion(documentBytes);
			log.info("Uploading unsigned document for document version: {}", documentVersion.getId());
			return path;
		});
	}

	private Optional<SignedPdfResult> signCompletedPdf(DocumentVersion documentVersion, byte[] documentBytes) {
		if (pdfSigningService.isPresent() && pdfSigningService.get().isSigningEnabled()) {
			try {
				log.info("Signing completed PDF for document version: {}", documentVersion.getId());
				return Optional.ofNullable(pdfSigningService.get().signPdf(documentBytes));
			}
			catch (Exception e) {
				// Log error but don't fail the envelope completion
				// The envelope can still be completed without the PDF signature
				log.error("Failed to sign PDF for document version: " + documentVersion.getId()
						+ ". Envelope will complete without PDF signature.", e);
			}
		}
		return Optional.empty();
	}

	private LatestDocumentData downloadLatestDocumentBytes(Document document, DocumentVersion currentVersion) {
		int attempt = 0;
		DocumentVersion documentVersion = currentVersion;

		while (attempt < s3MaxAttempts) {
			try {
				byte[] bytes = amazonS3Service.downloadFileAsBytes(bucketName, documentVersion.getFilePath());
				return new LatestDocumentData(bytes, documentVersion);
			}
			catch (S3Exception ex) {
				if (ex.statusCode() == 404) {
					attempt++;
					if (attempt >= s3MaxAttempts) {
						throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOWNLOAD_FILE_MAX_ATTEMPT_FAILED,
								new Integer[] { attempt });
					}
					documentVersion = getPreviousDocumentVersion(document, documentVersion.getVersionNumber());
				}
				else {
					throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_DOWNLOAD_FILE);
				}
			}
		}

		// Final fallback
		DocumentVersion firstDocumentVersion = getDocumentVersion(1, document.getId());
		byte[] bytes = amazonS3Service.downloadFileAsBytes(bucketName, firstDocumentVersion.getFilePath());
		return new LatestDocumentData(bytes, firstDocumentVersion);
	}

	public DocumentVersion getPreviousDocumentVersion(Document document, int currentVersionNumber) {
		List<DocumentVersion> versions = document.getVersions();
		if (versions == null || versions.isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_VERSIONS_EMPTY);
		}
		return versions.stream()
			.filter(v -> v.getVersionNumber() < currentVersionNumber)
			.max(Comparator.comparingInt(DocumentVersion::getVersionNumber))
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_NO_PREVIOUS_VERSION));
	}

	private byte[] mergeAllFieldsToDocument(DocumentVersion currentVersion, byte[] documentBytes) {
		List<DocumentVersionField> fieldVersionList = currentVersion.getFieldVersions();
		byte[] updatedDocumentBytes = documentBytes;

		Map<String, byte[]> imageCache = new HashMap<>();

		for (DocumentVersionField documentVersionField : fieldVersionList) {
			FieldSignDto fieldSignDto = convertToFieldSignDto(documentVersionField);
			updatedDocumentBytes = mergeFieldToDocument(documentVersionField, fieldSignDto, updatedDocumentBytes,
					imageCache);
		}

		return updatedDocumentBytes;
	}

	private byte[] mergeFieldsToLatestDocument(List<DocumentVersionField> fieldVersionList, byte[] documentBytes,
			KeyPair keyPair) {

		Map<String, byte[]> imageCache = new HashMap<>();

		byte[] updatedBytes = documentBytes;
		for (DocumentVersionField documentVersionField : fieldVersionList) {
			FieldSignDto fieldSignDto = convertToFieldSignDto(documentVersionField);
			updatedBytes = updateDocumentAfterFieldVerification(documentVersionField, keyPair, fieldSignDto,
					updatedBytes, imageCache);
		}

		return updatedBytes;
	}

	private byte[] mergeAllFieldsToFinalDocument(Document document, byte[] documentBytes) {
		byte[] fullDocumentBytes = documentBytes;

		for (DocumentVersion version : document.getVersions()) {
			if (version.getFieldVersions() != null) {
				Map<String, byte[]> imageCache = new HashMap<>();

				for (DocumentVersionField documentVersionField : version.getFieldVersions()) {
					FieldSignDto fieldSignDto = convertToFieldSignDto(documentVersionField);

					KeyPair keyPair = loadKeyPair(
							documentVersionField.getField().getRecipient().getAddressBook().getId());

					fullDocumentBytes = updateDocumentAfterFieldVerification(documentVersionField, keyPair,
							fieldSignDto, fullDocumentBytes, imageCache);
				}
			}
		}

		return fullDocumentBytes;
	}

	private DocumentVersion signFinalDocumentVersionBySender(Document document, byte[] documentBytes, String filePath,
			KeyPair keyPairSender) {

		String finalHash = hashDocument(new ByteArrayInputStream(documentBytes));
		String finalSignature = signDocument(Base64.getDecoder().decode(finalHash), keyPairSender.getPrivate());

		DocumentVersion finalVersion = new DocumentVersion();
		finalVersion.setDocument(document);
		finalVersion.setVersionNumber(document.getCurrentVersion() + 1);
		finalVersion.setAddressBook(document.getEnvelope().getOwner());
		finalVersion.setFilePath(filePath);
		finalVersion.setDocumentHash(finalHash);

		DocumentSignature documentSignature = new DocumentSignature();
		documentSignature.setSignature(finalSignature);
		finalVersion.setSignatures(documentSignature);

		return finalVersion;
	}

	@Override
	@Transactional
	public ResponseEntityDto signField(DocumentFieldSignDto documentFieldSignDto, String ipAddress) {

		String username = getCurrentUsername();

		if (username == null) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}

		AddressBook currentAddressBookUser = getCurrentAddressBookUser(username);

		if (currentAddressBookUser == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_USER_NOT_FOUND);
		}

		validateDocumentFieldSignRequest(documentFieldSignDto);

		Recipient recipient = getRecipientById(documentFieldSignDto.getRecipientId());

		if (!recipient.getAddressBook().getId().equals(currentAddressBookUser.getId())) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_CURRENT_USER_NOT_MATCH);
		}

		Document document = documentRepository.findById(documentFieldSignDto.getDocumentId())
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_NOT_FOUND));

		if (!document.getEnvelope().getId().equals(documentFieldSignDto.getEnvelopeId())) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_DOCUMENT_MISMATCH);
		}

		boolean recipientExists = document.getEnvelope()
			.getRecipients()
			.stream()
			.anyMatch(rec -> rec.getId().equals(documentFieldSignDto.getRecipientId()));

		if (!recipientExists) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_RECIPIENT_MISMATCH);
		}

		boolean fieldExists = recipient.getFields()
			.stream()
			.anyMatch(field -> field.getId().equals(documentFieldSignDto.getFieldSignDto().getFieldId()));

		if (!fieldExists) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_FIELD_MISMATCH);
		}

		Field field = fieldRepository.findById(documentFieldSignDto.getFieldSignDto().getFieldId())
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_FIELD_MISMATCH));

		validateInputField(documentFieldSignDto.getRecipientId(), documentFieldSignDto.getDocumentId(), field);

		if (document.getEnvelope().getSignType().equals(SignType.SEQUENTIAL)
				&& document.getCurrentSignOderNumber() != recipient.getSigningOrder()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_INVALID_SIGN_ORDER_RECIPIENT);
		}

		if (documentFieldSignDto.getFieldSignDto().getType().equals(FieldType.DECLINE)) {
			Envelope envelope = updateDeclineStatus(document, recipient);

			AuditTrail auditTrail = auditTrailService.processAuditTrailInfo(envelope, recipient,
					AuditAction.ENVELOPE_DECLINED, null, ipAddress, null);
			auditTrailDao.save(auditTrail);
			envelopeDao.save(envelope);
			recipientService.sendEmailWhenDocumentIsVoidedOrDeclined(envelope.getId());
			return new ResponseEntityDto(false, "The document was declined");
		}

		int pageNumber = documentFieldSignDto.getFieldSignDto().getPageNumber();

		if (pageNumber < 1 || pageNumber > document.getNumOfPages()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_INVALID_PAGE_NUMBER);
		}

		DocumentVersion currentVersion = getDocumentVersion(document.getCurrentVersion(),
				documentFieldSignDto.getDocumentId());

		KeyPair keyPairSign = loadKeyPair(currentAddressBookUser.getId());

		List<DocumentVersionField> documentVersionFieldList = new ArrayList<>();

		DocumentVersionField documentVersionField = processFieldSign(documentFieldSignDto, keyPairSign.getPrivate(),
				field);

		documentVersionField.setDocumentVersion(currentVersion);

		documentVersionFieldList.add(documentVersionField);

		if (documentFieldSignDto.getFieldSignDto().getType().equals(FieldType.SIGNATURE)
				|| documentFieldSignDto.getFieldSignDto().getType().equals(FieldType.INITIAL)) {
			updateOtherFieldsOfSameType(documentFieldSignDto, recipient, keyPairSign, documentVersionFieldList);
		}

		documentVersionFieldRepository.saveAll(documentVersionFieldList);

		field.setStatus(FieldStatus.COMPLETED);
		fieldRepository.save(field);

		return new ResponseEntityDto(false, "New Document Field Version successfully created");

	}

	private void validateInputField(Long recipientId, Long documentId, Field field) {
		if (field.getStatus().equals(FieldStatus.COMPLETED)) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_FIELD_SIGN_COMPLETED);
		}

		if (!field.getRecipient().getId().equals(recipientId)) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_NOT_VALID_RECIPIENT_FOR_ENVELOPE);
		}

		if (!field.getDocument().getId().equals(documentId)) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_NOT_FOUND);
		}
	}

	private Envelope updateDeclineStatus(Document document, Recipient recipient) {
		Envelope envelope = document.getEnvelope();
		envelope.getRecipients().forEach(recipientData -> {
			if (recipientData.getId().equals(recipient.getId())) {
				recipientData.setStatus(RecipientStatus.DECLINED);
			}

			if (envelope.getSignType().equals(SignType.PARALLEL)
					&& recipientData.getStatus().equals(RecipientStatus.NEED_TO_SIGN)) {
				recipientData.setStatus(RecipientStatus.EMPTY);
			}

			recipientData.setInboxStatus(InboxStatus.DECLINED);
		});

		envelope.setStatus(EnvelopeStatus.DECLINED);
		return envelope;
	}

	private void updateOtherFieldsOfSameType(DocumentFieldSignDto documentFieldSignDto, Recipient recipient,
			KeyPair keyPairSign, List<DocumentVersionField> documentVersionFieldList) {
		List<Field> otherSameTypeFields = fieldRepository.findByRecipientAndTypeAndStatus(recipient,
				documentFieldSignDto.getFieldSignDto().getType(), FieldStatus.COMPLETED);
		for (Field otherSameTypeField : otherSameTypeFields) {
			DocumentVersionField otherFieldVersion = documentVersionFieldRepository.findByField(otherSameTypeField);

			if (!otherFieldVersion.getValue().equals(documentFieldSignDto.getFieldSignDto().getFieldValue())) {

				if (!otherSameTypeField.getRecipient().getId().equals(documentFieldSignDto.getRecipientId())) {
					throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_NOT_VALID_RECIPIENT_FOR_ENVELOPE);
				}

				if (!otherSameTypeField.getDocument().getId().equals(documentFieldSignDto.getDocumentId())) {
					throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_NOT_FOUND);
				}

				FieldSignDto fieldSignDto = eSignMapper.fieldToFieldSignDto(otherSameTypeField);
				fieldSignDto.setFieldValue(documentFieldSignDto.getFieldSignDto().getFieldValue());

				otherFieldVersion = createSignedField(fieldSignDto, keyPairSign.getPrivate(), otherSameTypeField);
				documentVersionFieldList.add(otherFieldVersion);

			}

		}
	}

	@Override
	public ResponseEntityDto editDocument(Long id, EditDocumentDto editDocumentDto) {
		log.info("editDocument: Start editing document with id {}", id);

		Document document = documentRepository.findById(id).orElseThrow(() -> {
			log.error("editDocument: Document with id {} not found", id);
			return new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_NOT_FOUND);
		});

		if (document.getEnvelope() != null) {
			log.error("editDocument: Document with id {} is already associated with an envelope", id);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_ALREADY_ASSOCIATED_WITH_ENVELOPE);
		}

		if (editDocumentDto.getName() != null) {
			document.setName(editDocumentDto.getName());
		}
		if (editDocumentDto.getFilePath() != null) {
			document.setFilePath(bucketName + "/" + editDocumentDto.getFilePath());
		}

		documentRepository.save(document);
		log.info("editDocument: Document with id {} successfully updated", id);

		return new ResponseEntityDto(false, document);
	}

	@Override
	public ResponseEntityDto deleteDocument(Long id) {
		log.info("deleteDocument: Start deleting document with id {}", id);

		Document document = documentRepository.findById(id).orElseThrow(() -> {
			log.error("deleteDocument: Document with id {} not found", id);
			return new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_NOT_FOUND);
		});

		if (document.getEnvelope() != null) {
			log.error("deleteDocument: Document with id {} is already associated with an envelope", id);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_ALREADY_ASSOCIATED_WITH_ENVELOPE);
		}

		documentRepository.delete(document);
		log.info("deleteDocument: Document with id {} successfully deleted", id);

		return new ResponseEntityDto(false, "Document successfully deleted");
	}

	private UserDetails getCurrentUserDetails() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication != null && authentication.isAuthenticated()) {
			Object principal = authentication.getPrincipal();

			if (principal instanceof UserDetails) {
				return (UserDetails) principal;
			}
		}
		return null;
	}

	@Override
	public String getCurrentUsername() {
		UserDetails userDetails = getCurrentUserDetails();
		return (userDetails != null) ? userDetails.getUsername() : null;
	}

	private boolean hasNonWaitingRecipient(Long envelopeId) {
		Envelope envelope = envelopeDao.findByIdWithRecipientsForUpdate(envelopeId);
		List<Recipient> recipients = envelope.getRecipients();
		return recipients != null && recipients.stream().anyMatch(r -> r.getStatus() != RecipientStatus.COMPLETED);
	}

	private String uploadProcessedDocumentVersion(byte[] updatedDocumentBytes) {
		String tenantId = TenantContext.getCurrentTenant();

		if (tenantId == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_ID_NOT_FOUND);
		}

		String randomUrl = EsignUtil.randomUrlPath();

		String fileUrl = bucketName + UPLOAD_DOCUMENT_URL_PATH + tenantId + "/" + randomUrl;

		try (InputStream inputStream = new ByteArrayInputStream(updatedDocumentBytes)) {
			amazonS3Service.uploadFile(bucketName, fileUrl, inputStream);
		}
		catch (IOException e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_UPLOAD_FILE);
		}
		return fileUrl;
	}

	private DocumentVersion verifyDocumentVersionsRelatedToDocument(Document document, DocumentVersion currentVersion,
			byte[] latestDocumentBytes) {

		KeyPair keyPair = loadKeyPair(document.getEnvelope().getOwner().getId());

		String fileUrl = currentVersion.getFilePath();

		return createNewDocumentVersion(new DocumentSignDto(), currentVersion, fileUrl, keyPair.getPrivate(),
				document.getEnvelope().getOwner(), latestDocumentBytes);

	}

	private boolean isDocumentComplete(List<Recipient> nextSignRecipientList) {
		if (nextSignRecipientList.isEmpty()) {
			return true;
		}

		boolean containsSigner = nextSignRecipientList.stream()
			.anyMatch(recipient -> MemberRole.SIGNER.equals(recipient.getMemberRole()));

		return !containsSigner;
	}

	private byte[] updateDocumentAfterFieldVerification(DocumentVersionField documentVersionField, KeyPair keyPairSign,
			FieldSignDto fieldSignDto, byte[] documentBytes, Map<String, byte[]> imageCache) {

		return switch (documentVersionField.getField().getType()) {
			case DATE, NAME, EMAIL, TEXT, DROPDOWN, CHECKBOX, RADIO_BUTTON -> {
				verifyTextField(documentVersionField.getValue(), keyPairSign.getPublic(),
						documentVersionField.getFieldSignature());
				yield documentProcessingService.mergeTextFieldToDocument(fieldSignDto, documentBytes);

			}
			case SIGNATURE, INITIAL, STAMP -> {
				String imageUrl = documentVersionField.getValue();

				try {
					byte[] imageBytes = imageCache.computeIfAbsent(imageUrl, url -> {
						try (InputStream imageStream = amazonS3Service.downloadFile(bucketName, url);
								ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
							imageStream.transferTo(outputStream);
							return outputStream.toByteArray();
						}
						catch (Exception e) {
							log.error("mergeFieldToDocument: Failed to load image: {}", url, e);
							throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_LOAD_IMAGE,
									new String[] { url });
						}
					});

					verifyImageField(imageBytes, keyPairSign.getPublic(), documentVersionField.getFieldSignature());
					yield documentProcessingService.mergeImageFieldToDocument(fieldSignDto, documentBytes, imageBytes);
				}
				catch (ModuleException e) {
					log.error("updateDocumentAfterFieldVerification: Failed to process image", e);
					throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_PROCESSING_IMAGE_FIELD,
							new String[] { documentVersionField.getValue() });
				}
			}

			default -> {
				log.info("updateDocumentAfterFieldVerification: No processing required for field type: {}",
						documentVersionField.getField().getType());
				yield documentBytes;
			}
		};
	}

	private byte[] mergeFieldToDocument(DocumentVersionField documentVersionField, FieldSignDto fieldSignDto,
			byte[] documentBytes, Map<String, byte[]> imageCache) {

		return switch (documentVersionField.getField().getType()) {
			case DATE, NAME, EMAIL, TEXT, DROPDOWN, CHECKBOX, RADIO_BUTTON ->
				documentProcessingService.mergeTextFieldToDocument(fieldSignDto, documentBytes);

			case SIGNATURE, INITIAL, STAMP -> {
				String imageUrl = documentVersionField.getValue();

				try {
					byte[] imageBytes = imageCache.computeIfAbsent(imageUrl, url -> {
						try (InputStream imageStream = amazonS3Service.downloadFile(bucketName, url);
								ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
							imageStream.transferTo(outputStream);
							return outputStream.toByteArray();
						}
						catch (Exception e) {
							log.error("mergeFieldToDocument: Failed to load image: {}", url, e);
							throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_LOAD_IMAGE,
									new String[] { url });
						}
					});

					yield documentProcessingService.mergeImageFieldToDocument(fieldSignDto, documentBytes, imageBytes);
				}
				catch (ModuleException e) {
					log.error("mergeFieldToDocument: Failed to process image", e);
					throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_PROCESSING_IMAGE_FIELD,
							new String[] { documentVersionField.getValue() });
				}
			}

			default -> {
				log.info("mergeFieldToDocument: No processing required for field type: {}",
						documentVersionField.getField().getType());
				yield documentBytes;
			}
		};
	}

	private byte[] updateEnvelopeUuidInDocument(String value, byte[] documentBytes, int numOfPages) {

		return documentProcessingService.updateEnvelopeUuidToEachPage(value, documentBytes, numOfPages);
	}

	private DocumentVersionFieldBulk processFieldLevelSign(DocumentSignDto documentSignDto, PrivateKey privateKey,
			DocumentVersion currentVersion) {
		List<DocumentVersionField> documentVersionFields = new ArrayList<>();
		List<Field> fields = new ArrayList<>();
		Map<String, DocumentVersionField> signedImageCache = new HashMap<>();
		Map<Long, List<Field>> groupFieldsMap = new HashMap<>();

		if (documentSignDto.getFieldSignDtoList() == null || documentSignDto.getFieldSignDtoList().isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_EMPTY_FIELD_SIGN_LIST);
		}

		for (FieldSignDto fieldSignDto : documentSignDto.getFieldSignDtoList()) {
			Field field = fieldRepository.findById(fieldSignDto.getFieldId())
				.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_FIELD_MISMATCH));

			validateInputField(documentSignDto.getRecipientId(), documentSignDto.getDocumentId(), field);

			FieldType fieldType = fieldSignDto.getType();

			if (fieldType.equals(FieldType.DECLINE)) {
				markField(field, fields, FieldStatus.SKIP);
			}
			else if (FieldType.imageFieldTypes().contains(fieldType)) {

				if (fieldSignDto.getFieldValue() == null) {
					throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FIELD_VALUE_NOT_FOUND);
				}
				fieldSignDto.setFieldValue(processImageFieldPath(fieldSignDto.getFieldValue()));
				String imageUrl = fieldSignDto.getFieldValue();

				DocumentVersionField documentVersionField;
				if (signedImageCache.containsKey(imageUrl)) {
					documentVersionField = cloneWithNewFieldAndVersion(signedImageCache.get(imageUrl), field,
							currentVersion, fieldSignDto);
				}
				else {
					documentVersionField = signImageField(fieldSignDto, privateKey, field);
					signedImageCache.put(imageUrl, documentVersionField);
				}

				populateFieldMetadata(documentVersionField, fieldSignDto, field, currentVersion);
				documentVersionFields.add(documentVersionField);
				markField(field, fields, FieldStatus.COMPLETED);
			}
			else {
				DocumentVersionField documentVersionField = switch (fieldType) {
					case DATE, APPROVE, NAME, EMAIL, TEXT, DROPDOWN, CHECKBOX, RADIO_BUTTON ->
						signTextField(fieldSignDto, privateKey, field);
					default -> throw new IllegalStateException("Unsupported field type: " + fieldType);
				};

				populateFieldMetadata(documentVersionField, fieldSignDto, field, currentVersion);
				documentVersionFields.add(documentVersionField);
				markField(field, fields, FieldStatus.COMPLETED);

				if (field.getFieldContainer() != null
						&& (field.getType() == FieldType.CHECKBOX || field.getType() == FieldType.RADIO_BUTTON
								|| field.getType() == FieldType.DROPDOWN || field.getType() == FieldType.TEXT)) {

					Long containerId = field.getFieldContainer().getId();
					groupFieldsMap.computeIfAbsent(containerId, k -> new ArrayList<>()).add(field);
				}
			}
		}

		fields.addAll(processAndValidateAdvanceFields(documentSignDto.getDocumentId(), documentSignDto.getRecipientId(),
				fields, groupFieldsMap));

		return new DocumentVersionFieldBulk(documentVersionFields, fields);
	}

	private void markField(Field field, List<Field> fields, FieldStatus status) {
		field.setStatus(status);
		fields.add(field);
	}

	private DocumentVersionFieldBulk processDocumentFields(DocumentSignDto documentSignDto,
			DocumentVersion currentVersion) {
		List<DocumentVersionField> documentVersionFields = new ArrayList<>();
		List<Field> fields = new ArrayList<>();

		Map<Long, List<Field>> groupFieldsMap = new HashMap<>();

		documentSignDto.getFieldSignDtoList().forEach(fieldSignDto -> {
			Field field = fieldRepository.findById(fieldSignDto.getFieldId())
				.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_FIELD_MISMATCH));

			validateInputField(documentSignDto.getRecipientId(), documentSignDto.getDocumentId(), field);

			// Skip processing if DECLINE
			if (fieldSignDto.getType().equals(FieldType.DECLINE)) {
				field.setStatus(FieldStatus.SKIP);
				fields.add(field);
				return;
			}

			if (fieldSignDto.getFieldValue() == null) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FIELD_VALUE_NOT_FOUND);
			}

			if (FieldType.imageFieldTypes().contains(fieldSignDto.getType()) && fieldSignDto.getFieldValue() != null) {
				fieldSignDto.setFieldValue(processImageFieldPath(fieldSignDto.getFieldValue()));
			}

			DocumentVersionField documentVersionField = new DocumentVersionField();

			documentVersionField.setField(field);

			documentVersionField.setXPosition(fieldSignDto.getXposition());
			documentVersionField.setYPosition(fieldSignDto.getYposition());
			documentVersionField.setValue(fieldSignDto.getFieldValue());
			documentVersionField.setWidth(fieldSignDto.getWidth());
			documentVersionField.setHeight(fieldSignDto.getHeight());

			documentVersionField.setDocumentVersion(currentVersion);

			documentVersionFields.add(documentVersionField);

			if (field.getFieldContainer() != null
					&& (field.getType() == FieldType.CHECKBOX || field.getType() == FieldType.RADIO_BUTTON
							|| field.getType() == FieldType.DROPDOWN || field.getType() == FieldType.TEXT)) {

				Long containerId = field.getFieldContainer().getId();
				groupFieldsMap.computeIfAbsent(containerId, k -> new ArrayList<>()).add(field);
			}

			field.setStatus(FieldStatus.COMPLETED);
			fields.add(field);
		});

		fields.addAll(processAndValidateAdvanceFields(documentSignDto.getDocumentId(), documentSignDto.getRecipientId(),
				fields, groupFieldsMap));

		return new DocumentVersionFieldBulk(documentVersionFields, fields);
	}

	private String processImageFieldPath(String value) {
		return bucketName + "/" + value;
	}

	private DocumentVersionField processFieldSign(DocumentFieldSignDto documentFieldSignDto, PrivateKey privateKey,
			Field field) {

		FieldSignDto fieldSignDto = documentFieldSignDto.getFieldSignDto();

		return createSignedField(fieldSignDto, privateKey, field);
	}

	private DocumentVersionField signFieldVersion(FieldSignDto fieldSignDto, PrivateKey privateKey, Field field) {
		return switch (fieldSignDto.getType()) {
			case DATE, APPROVE, DECLINE, NAME, EMAIL, TEXT, DROPDOWN, CHECKBOX, RADIO_BUTTON ->
				signTextField(fieldSignDto, privateKey, field);
			case SIGNATURE, INITIAL, STAMP -> signImageField(fieldSignDto, privateKey, field);
		};
	}

	private DocumentVersion createNewDocumentVersion(DocumentSignDto signDto, DocumentVersion currentVersion,
			String fileUrl, PrivateKey privateKey, AddressBook addressBook, byte[] documentBytes) {

		String newHash = hashDocument(new ByteArrayInputStream(documentBytes));

		String signature = signDocument(Base64.getDecoder().decode(newHash), privateKey);

		if (signDto.getFieldSignDtoList() == null) {
			signDto.setFieldSignDtoList(new ArrayList<>());
		}

		return buildNewDocumentVersion(currentVersion, fileUrl, newHash, signature, addressBook);
	}

	@Override
	public KeyPair loadKeyPair(Long addressBookId) {
		UserKey userKey = userKeyService.getKeyPairByAddressBookId(addressBookId);
		try {
			byte[] decryptedPrivateKey = AESDecrypt.decryptAES(userKey.getPrivateKey(), aesKeyLoader.getAESKeyFromEnv(),
					Base64.getDecoder().decode(userKey.getVector()));
			PrivateKey privateKey = convertToPrivateKey(decryptedPrivateKey);
			PublicKey publicKey = convertToPublicKey(userKey.getPublicKey());
			return new KeyPair(publicKey, privateKey);
		}
		catch (Exception e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_LOAD_KEY_PAIR,
					new String[] { e.getMessage() });
		}
	}

	@Override
	public void verifyDocumentSignature(byte[] documentBytes, DocumentVersion currentVersion, PublicKey publicKey) {
		String currentHash = hashDocument(new ByteArrayInputStream(documentBytes));
		byte[] decodedHash = Base64.getDecoder().decode(currentHash);

		if (!verifySignature(decodedHash, currentVersion.getSignatures().getSignature(), publicKey)) {
			throw new ModuleException(EsignMessageConstant.ESIGN_VALIDATION_DOCUMENT_CONTENT_CHANGED);
		}
	}

	@Override
	public String signDocument(byte[] documentHash, PrivateKey privateKey) {
		try {
			Signature signature = Signature.getInstance(SIGNATURE_ALGORITHM, SECURITY_PROVIDER);
			signature.initSign(privateKey);
			signature.update(documentHash);
			return Base64.getEncoder().encodeToString(signature.sign());
		}
		catch (Exception e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_SIGN_DOCUMENT,
					new String[] { e.getMessage() });
		}
	}

	@Override
	public String hashDocument(InputStream file) {
		try (InputStream inputStream = file) {
			MessageDigest digest = new SHA3.Digest256();
			byte[] buffer = new byte[BUFFER_SIZE];
			int bytesRead;

			while ((bytesRead = inputStream.read(buffer)) != -1) {
				digest.update(buffer, 0, bytesRead);
			}

			return Base64.getEncoder().encodeToString(digest.digest());
		}
		catch (IOException e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_HASH_DOCUMENT,
					new String[] { e.getMessage() });
		}
	}

	private String hashDocument(byte[] data) {
		try {
			MessageDigest digest = new SHA3.Digest256(); // Using SHA-3 for strong
			// security
			byte[] hashBytes = digest.digest(data);
			return Base64.getEncoder().encodeToString(hashBytes); // Encode in Base64
		}
		catch (Exception e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_HASH_DOCUMENT,
					new String[] { e.getMessage() });
		}
	}

	private boolean verifySignature(byte[] documentHash, String base64Signature, PublicKey publicKey) {
		try {
			Signature signature = Signature.getInstance(SIGNATURE_ALGORITHM, SECURITY_PROVIDER);
			signature.initVerify(publicKey);
			signature.update(documentHash);
			return signature.verify(Base64.getDecoder().decode(base64Signature));
		}
		catch (Exception e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_VERIFY_SIGNATURE,
					new String[] { e.getMessage() });
		}
	}

	private PrivateKey convertToPrivateKey(byte[] privateKeyBytes) {
		try {
			KeyFactory keyFactory = KeyFactory.getInstance(KEY_ALGORITHM, SECURITY_PROVIDER);
			return keyFactory.generatePrivate(new PKCS8EncodedKeySpec(privateKeyBytes));
		}
		catch (Exception e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_CONVERT_PRIVATE_KEY,
					new String[] { e.getMessage() });
		}
	}

	private PublicKey convertToPublicKey(String base64EncodedPublicKey) {
		try {
			byte[] decodedKey = Base64.getDecoder().decode(base64EncodedPublicKey);
			KeyFactory keyFactory = KeyFactory.getInstance(KEY_ALGORITHM, SECURITY_PROVIDER);
			return keyFactory.generatePublic(new X509EncodedKeySpec(decodedKey));
		}
		catch (Exception e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_CONVERT_PUBLIC_KEY,
					new String[] { e.getMessage() });
		}
	}

	private DocumentVersionField signImageField(FieldSignDto fieldDto, PrivateKey privateKey, Field field) {
		try (InputStream imageStream = amazonS3Service.downloadFile(bucketName, fieldDto.getFieldValue());
				ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

			imageStream.transferTo(outputStream);
			byte[] imageBytes = outputStream.toByteArray();

			String newHash = hashDocument(imageBytes);

			String signature = signDocument(Base64.getDecoder().decode(newHash), privateKey);
			return getDocumentVersionField(newHash, signature, field);
		}
		catch (Exception e) {
			log.error("Failed to load image: {}", fieldDto.getFieldValue(), e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_LOAD_IMAGE,
					new String[] { fieldDto.getFieldValue() });
		}
	}

	private DocumentVersionField signTextField(FieldSignDto fieldDto, PrivateKey privateKey, Field field) {
		try {
			String newHash = HashUtil.hash(fieldDto.getFieldValue());
			String signature = signDocument(Base64.getDecoder().decode(newHash), privateKey);
			return getDocumentVersionField(newHash, signature, field);
		}
		catch (Exception e) {
			log.error("Failed to load image: {}", fieldDto.getFieldValue(), e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_LOAD_IMAGE,
					new String[] { fieldDto.getFieldValue() });
		}
	}

	private void verifyImageField(byte[] imageBytes, PublicKey publicKey, String base64Signature) {
		try {
			String currentHash = hashDocument(imageBytes);
			byte[] decodedHash = Base64.getDecoder().decode(currentHash);

			if (!verifySignature(decodedHash, base64Signature, publicKey)) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FIELD_CONTENT_CHANGED);
			}
		}
		catch (Exception e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_IMAGE_VERIFY_FAIL);
		}
	}

	private void verifyTextField(String data, PublicKey publicKey, String base64Signature) {
		String currentHash = HashUtil.hash(data);
		byte[] decodedHash = Base64.getDecoder().decode(currentHash);

		if (!verifySignature(decodedHash, base64Signature, publicKey)) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FIELD_CONTENT_CHANGED);
		}

	}

	private DocumentVersion getDocumentVersion(int versionNumber, Long documentId) {
		return documentVersionDao.findByVersionNumberAndDocumentId(versionNumber, documentId)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_VERSION_NOT_FOUND));
	}

	private DocumentVersion getDocumentVersionForUpdate(int versionNumber, Long documentId) {
		List<DocumentVersion> documentVersionList = documentVersionDao
			.findByVersionNumberAndDocumentIdForUpdateOrdered(versionNumber, documentId);

		if (documentVersionList.isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_VERSION_NOT_FOUND);
		}

		return documentVersionList.getFirst();
	}

	@Override
	public AddressBook getCurrentAddressBookUser(@NotNull String userName) {
		return addressBookDao.findByInternalUserEmail(userName)
			.orElseGet(() -> addressBookDao.findByExternalUserEmail(userName).orElse(null));
	}

	private Recipient getRecipientById(@NotNull Long id) {

		return recipientDao.findById(id)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_NOT_FOUND));
	}

	private void validateDocumentSignRequest(@NotNull DocumentSignDto request) {

		if (request.getDocumentId() == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_ID_NOT_FOUND);
		}

		if (request.getRecipientId() == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_ID_NOT_FOUND);
		}
	}

	private void validateDocumentFieldSignRequest(@NotNull DocumentFieldSignDto request) {

		if (request.getDocumentId() == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_ID_NOT_FOUND);
		}

		if (request.getFieldSignDto() == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_EMPTY_FIELD_SIGN_LIST);
		}

		if (request.getRecipientId() == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_ID_NOT_FOUND);
		}
	}

	private DocumentVersionField getDocumentVersionField(String newHash, String signature, Field field) {

		DocumentVersionField documentVersionField = documentVersionFieldRepository.findByField(field);

		if (documentVersionField == null) {
			documentVersionField = new DocumentVersionField();
		}

		documentVersionField.setFieldHash(newHash);
		documentVersionField.setFieldSignature(signature);
		return documentVersionField;
	}

	private DocumentVersion getDocumentVersionObj(Document document) {
		DocumentVersion currentVersion = new DocumentVersion();
		currentVersion.setFilePath(document.getFilePath());
		currentVersion.setVersionNumber(0);
		currentVersion.setDocument(document);
		return currentVersion;
	}

	@Override
	public DocumentVersion buildNewDocumentVersion(DocumentVersion currentVersion, String filePath, String hash,
			String signature, AddressBook addressBook) {

		DocumentVersion newVersion = new DocumentVersion();
		newVersion.setDocument(currentVersion.getDocument());
		newVersion.setVersionNumber(currentVersion.getVersionNumber() + 1);
		newVersion.setAddressBook(addressBook);
		newVersion.setFilePath(filePath);
		newVersion.setDocumentHash(hash);

		DocumentSignature documentSignature = new DocumentSignature();
		documentSignature.setSignature(signature);
		newVersion.setSignatures(documentSignature);

		return newVersion;
	}

	@Override
	public ResponseEntityDto getDocumentDimensions(Long id) {

		AddressBook currentAddressBookUser = getCurrentAddressBookUser(getCurrentUsername());

		Document document = documentRepository.findById(id)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_NOT_FOUND));

		boolean isRecipient = document.getEnvelope()
			.getRecipients()
			.stream()
			.anyMatch(recipient -> recipient.getAddressBook().getId().equals(currentAddressBookUser.getId()));

		if (!isRecipient) {
			boolean isOwner = document.getEnvelope().getOwner().getId().equals(currentAddressBookUser.getId());
			if (!isOwner) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_CURRENT_USER_NOT_MATCH);
			}
		}

		if (document.getFilePath() == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_FILE_PATH_NOT_FOUND);
		}

		byte[] documentBytes = amazonS3Service.downloadFileAsBytes(bucketName, document.getFilePath());

		Map<Integer, PageDimensionResponseDto> result = documentProcessingService
			.processDocumentDimensions(documentBytes);
		return new ResponseEntityDto(false, result);
	}

	@Override
	public ResponseEntityDto generateImageListFromPdf(Long id) {

		String documentFilePath = getDocumentFilePath(id);

		byte[] documentBytes = amazonS3Service.downloadFileAsBytes(bucketName, documentFilePath);
		List<byte[]> imageList = documentProcessingService.convertPDFdocumentToImageList(documentBytes);
		List<String> base64Images = imageList.stream()
			.map(imgBytes -> Base64.getEncoder().encodeToString(imgBytes))
			.toList();

		return new ResponseEntityDto(false, base64Images);
	}

	@Override
	public ResponseEntityDto getImageListMetadataFromPdf(Long id) {

		String documentFilePath = getDocumentFilePath(id);

		byte[] documentBytes = amazonS3Service.downloadFileAsBytes(bucketName, documentFilePath);

		int documentNumOfPages = documentProcessingService.getNumberOfPages(documentBytes);

		DocumentPdfConvertMetaResponseDto responseDto = new DocumentPdfConvertMetaResponseDto();
		responseDto.setDocumentId(id);
		responseDto.setNumberOfPages(documentNumOfPages);

		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	public ResponseEntityDto generateImageListFromPdfPage(
			DocumentPdfConvertFilterRequestDto documentPdfConvertFilterRequestDto) {

		String documentFilePath = getDocumentFilePath(documentPdfConvertFilterRequestDto.getDocumentId());

		byte[] documentBytes = amazonS3Service.downloadFileAsBytes(bucketName, documentFilePath);
		byte[] image = documentProcessingService.convertPDFdocumentToImage(documentBytes,
				documentPdfConvertFilterRequestDto.getPage());

		return new ResponseEntityDto(false, image);
	}

	private DocumentVersionField createSignedField(FieldSignDto fieldSignDto, PrivateKey privateKey, Field field) {

		if (FieldType.imageFieldTypes().contains(fieldSignDto.getType())) {
			String url = bucketName + "/" + fieldSignDto.getFieldValue();
			fieldSignDto.setFieldValue(url);
		}

		DocumentVersionField documentVersionField = signFieldVersion(fieldSignDto, privateKey, field);

		if (documentVersionField.getId() == null) {
			documentVersionField.setField(field);
		}

		documentVersionField.setXPosition(fieldSignDto.getXposition());
		documentVersionField.setYPosition(fieldSignDto.getYposition());
		documentVersionField.setValue(fieldSignDto.getFieldValue());
		documentVersionField.setWidth(fieldSignDto.getWidth());
		documentVersionField.setHeight(fieldSignDto.getHeight());

		return documentVersionField;
	}

	private FieldSignDto convertToFieldSignDto(DocumentVersionField documentVersionField) {
		FieldSignDto fieldSignDto = new FieldSignDto();

		fieldSignDto.setFieldValue(documentVersionField.getValue());
		fieldSignDto.setXposition(documentVersionField.getXPosition());
		fieldSignDto.setYposition(documentVersionField.getYPosition());
		fieldSignDto.setPageNumber(documentVersionField.getField().getPageNumber());
		fieldSignDto.setWidth(documentVersionField.getWidth());
		fieldSignDto.setHeight(documentVersionField.getHeight());

		return fieldSignDto;
	}

	private DocumentVersionField cloneWithNewFieldAndVersion(DocumentVersionField original, Field field,
			DocumentVersion currentVersion, FieldSignDto fieldSignDto) {
		DocumentVersionField clone = new DocumentVersionField();
		clone.setFieldSignature(original.getFieldSignature());
		clone.setFieldHash(original.getFieldHash());
		populateFieldMetadata(clone, fieldSignDto, field, currentVersion);
		return clone;
	}

	private void populateFieldMetadata(DocumentVersionField documentVersionField, FieldSignDto dto, Field field,
			DocumentVersion version) {
		documentVersionField.setField(field);
		documentVersionField.setXPosition(dto.getXposition());
		documentVersionField.setYPosition(dto.getYposition());
		documentVersionField.setWidth(dto.getWidth());
		documentVersionField.setHeight(dto.getHeight());
		documentVersionField.setValue(dto.getFieldValue());
		documentVersionField.setDocumentVersion(version);
	}

	private record DocumentVersionFieldBulk(List<DocumentVersionField> documentVersionFields, List<Field> fields) {
	}

	private record LatestDocumentData(byte[] fileBytes, DocumentVersion documentVersion) {
	}

	private String getDocumentFilePath(Long id) {

		AddressBook currentAddressBookUser = getCurrentAddressBookUser(getCurrentUsername());

		Document document = documentRepository.findById(id)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_NOT_FOUND));

		DocumentVersion documentVersion = documentVersionDao
			.findByVersionNumberAndDocumentId(document.getCurrentVersion(), id)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_VERSION_NOT_FOUND));

		boolean isRecipient = document.getEnvelope()
			.getRecipients()
			.stream()
			.anyMatch(recipient -> recipient.getAddressBook().getId().equals(currentAddressBookUser.getId()));

		if (!isRecipient) {
			boolean isOwner = document.getEnvelope().getOwner().getId().equals(currentAddressBookUser.getId());
			if (!isOwner) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_CURRENT_USER_NOT_MATCH);
			}
		}

		if (documentVersion.getFilePath() == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_FILE_PATH_NOT_FOUND);
		}
		return documentVersion.getFilePath();
	}

	/**
	 * Appends certificate to document bytes (in-memory processing). Returns merged bytes
	 * or original bytes if appending fails.
	 */
	private byte[] appendCertificateToBytes(Envelope envelope, DocumentVersion documentVersion, byte[] documentBytes,
			boolean isDocAccess) {
		try {
			log.info("Appending certificate to document for envelope {}", envelope.getId());

			byte[] certificateBytes = signatureCertificateService.generateCertificatePdfBytes(envelope.getId(),
					isDocAccess, envelope);
			byte[] mergedDocBytes = documentProcessingService.appendCertificateToPdf(documentBytes, certificateBytes);

			log.info("Successfully appended certificate to document bytes for envelope {}", envelope.getId());
			return mergedDocBytes;
		}
		catch (IOException e) {
			log.error("Failed to append certificate for envelope {}. Returning original bytes.", envelope.getId(), e);
			return documentBytes;
		}
	}

	private List<Field> processAndValidateAdvanceFields(Long documentId, Long recipientId, List<Field> fields,
			Map<Long, List<Field>> groupFieldsMap) {

		List<Field> allRecipientFieldList = fieldRepository.findByDocument_IdAndRecipient_Id(documentId, recipientId);

		List<FieldContainer> distinctFieldContainerList = allRecipientFieldList.stream()
			.map(Field::getFieldContainer)
			.filter(Objects::nonNull)
			.distinct()
			.toList();

		if (!distinctFieldContainerList.isEmpty()) {
			for (FieldContainer fieldContainer : distinctFieldContainerList) {
				if (Boolean.TRUE.equals(fieldContainer.getIsRequired())
						&& !groupFieldsMap.containsKey(fieldContainer.getId())) {
					throw new ModuleException(
							EsignMessageConstant.ESIGN_ERROR_AT_LEAST_ONE_FIELD_REQUIRED_FOR_CONTAINER,
							new String[] { fieldContainer.getId().toString() });
				}
				if (Boolean.FALSE.equals(fieldContainer.getIsMultiSelect())
						&& groupFieldsMap.containsKey(fieldContainer.getId())
						&& groupFieldsMap.get(fieldContainer.getId()).size() > 1) {
					throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_MULTISELECTION_NOT_ALLOWED,
							new String[] { fieldContainer.getId().toString() });
				}
			}
		}

		if (!groupFieldsMap.isEmpty()) {
			groupFieldsMap.forEach((key, value) -> {
				// Mark all fields in the container as COMPLETED
				value.forEach(groupField -> {
					if (!fields.contains(groupField)) {
						groupField.setStatus(FieldStatus.COMPLETED);
						fields.add(groupField);
					}
				});
			});
		}

		return fields;
	}

}
