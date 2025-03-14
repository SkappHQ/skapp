package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.enterprise.common.service.AmazonS3Service;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.mapper.EsignMapper;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.DocumentSignature;
import com.skapp.enterprise.esignature.model.DocumentVersion;
import com.skapp.enterprise.esignature.model.DocumentVersionField;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Field;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.model.UserKey;
import com.skapp.enterprise.esignature.payload.request.DocumentDto;
import com.skapp.enterprise.esignature.payload.request.DocumentFieldSignDto;
import com.skapp.enterprise.esignature.payload.request.DocumentSignDto;
import com.skapp.enterprise.esignature.payload.request.FieldSignDto;
import com.skapp.enterprise.esignature.payload.response.DocumentDetailResponseDto;
import com.skapp.enterprise.esignature.repository.AddressBookDao;
import com.skapp.enterprise.esignature.repository.DocumentRepository;
import com.skapp.enterprise.esignature.repository.DocumentVersionFieldRepository;
import com.skapp.enterprise.esignature.repository.DocumentVersionRepository;
import com.skapp.enterprise.esignature.repository.EnvelopeDao;
import com.skapp.enterprise.esignature.repository.FieldRepository;
import com.skapp.enterprise.esignature.repository.RecipientRepository;
import com.skapp.enterprise.esignature.security.AESKeyLoader;
import com.skapp.enterprise.esignature.service.DocumentProcessingService;
import com.skapp.enterprise.esignature.service.DocumentService;
import com.skapp.enterprise.esignature.service.RecipientService;
import com.skapp.enterprise.esignature.service.UserKeyService;
import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import com.skapp.enterprise.esignature.type.FieldStatus;
import com.skapp.enterprise.esignature.type.MemberRole;
import com.skapp.enterprise.esignature.type.RecipientStatus;
import com.skapp.enterprise.esignature.utill.EsignUtil;
import com.skapp.enterprise.esignature.utill.decryptor.AESDecrypt;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bouncycastle.jcajce.provider.digest.SHA3;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
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
import java.util.List;
import java.util.Optional;

import static com.skapp.community.common.util.DateTimeUtils.getCurrentUtcDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

	private static final int BUFFER_SIZE = 8192; // 8KB buffer

	private static final String SIGNATURE_ALGORITHM = "SHA3-256withECDSA";

	private static final String KEY_ALGORITHM = "EC";

	private static final String SECURITY_PROVIDER = "BC";

	@Value("${aws.s3.bucket-name}")
	private String bucketName;

	private final DocumentRepository documentRepository;

	private final AddressBookDao addressBookDao;

	private final DocumentVersionRepository documentVersionRepository;

	private final DocumentVersionFieldRepository documentVersionFieldRepository;

	private final RecipientRepository recipientRepository;

	private final EnvelopeDao envelopeDao;

	private final UserService userService;

	private final UserKeyService userKeyService;

	private final AmazonS3Service amazonS3Service;

	private final DocumentProcessingService documentProcessingService;

	private final RecipientService recipientService;

	private final FieldRepository fieldRepository;

	private final EsignMapper eSignMapper;

	private final AESKeyLoader aesKeyLoader;

	@Override
	public ResponseEntityDto saveDocument(DocumentDto documentDto) {
		Document document = eSignMapper.documentDtoToDocument(documentDto);
		document = documentRepository.save(document);
		DocumentDetailResponseDto documentResponseDto = eSignMapper.documentToDocumentDetailDto(document);
		return new ResponseEntityDto(false, documentResponseDto);
	}

	@Override
	@Transactional
	public DocumentVersion signFirstVersionDocument(DocumentSignDto documentSignDto) {
		try {

			User currentUser = userService.getCurrentUser();

			if (documentSignDto.getDocumentId() == null) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_ID_NOT_FOUND);
			}

			AddressBook currentAddressBookUser = getAddressBookIdByInternalUserId(currentUser);

			KeyPair keyPair = loadKeyPair(currentAddressBookUser.getId());

			Document document = documentRepository.findById(documentSignDto.getDocumentId())
				.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_NOT_FOUND));

			DocumentVersion currentVersion = getDocumentVersionObj(document);

			byte[] documentBytes = amazonS3Service.downloadFileAsBytes(bucketName, currentVersion.getFilePath());

			String fileUrl = currentVersion.getFilePath();

			return createNewDocumentVersion(documentSignDto, currentVersion, fileUrl, keyPair.getPrivate(),
					currentAddressBookUser, documentBytes);
		}
		catch (Exception e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_SIGN_DOCUMENT,
					new String[] { e.getMessage() });
		}
	}

	@Override
	@Transactional
	public ResponseEntityDto sequentialSignDocument(DocumentSignDto documentSignDto) {

		User currentUser = userService.getCurrentUser();

		AddressBook currentAddressBookUser = getAddressBookIdByInternalUserId(currentUser);

		validateDocumentSignRequest(documentSignDto);

		Recipient recipient = getRecipientById(documentSignDto.getRecipientId());

		if (!recipient.getAddressBook().getId().equals(currentAddressBookUser.getId())) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_CURRENT_USER_NOT_MATCH);
		}

		Document document = documentRepository.findById(documentSignDto.getDocumentId())
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_NOT_FOUND));

		if (document.getCurrentSignOderNumber() != recipient.getSigningOrder()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_INVALID_SIGN_ORDER_RECIPIENT);
		}

		DocumentVersion currentVersion = getDocumentVersion(document.getCurrentVersion(),
				documentSignDto.getDocumentId());

		// Load and validate keys-load previous user keys
		KeyPair keyPairVerify = loadKeyPair(currentVersion.getAddressBook().getId());

		byte[] documentBytes = amazonS3Service.downloadFileAsBytes(bucketName, currentVersion.getFilePath());

		// Process document version and verify existing signature
		verifyDocumentSignature(documentBytes, currentVersion, keyPairVerify.getPublic());

		// current user key pair for sign document
		KeyPair keyPairSign = loadKeyPair(currentAddressBookUser.getId());

		// if fields remain in complete flow
		if (documentSignDto.getFieldSignDtoList() != null && !documentSignDto.getFieldSignDtoList().isEmpty()) {
			DocumentVersionFieldBulk result = processFieldLevelSign(documentSignDto, keyPairSign.getPrivate(),
					currentVersion);

			documentVersionFieldRepository.saveAll(result.documentVersionFields());
			fieldRepository.saveAll(result.fields());
		}

		Recipient updatedRecipient = getRecipientById(documentSignDto.getRecipientId());

		updatedRecipient.getFields()
			.stream()
			.filter(field -> field.getStatus().equals(FieldStatus.EMPTY))
			.findAny()
			.ifPresent(fields -> {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ALL_FIELDS_NEED_SIGN);
			});

		updatedRecipient.setStatus(RecipientStatus.APPROVED);
		recipientRepository.save(updatedRecipient);

		// load current version version-fields
		List<DocumentVersionField> fieldVersionList = currentVersion.getFieldVersions();

		byte[] updatedDocumentBytes = documentBytes;

		for (DocumentVersionField documentVersionField : fieldVersionList) {
			FieldSignDto fieldSignDto = convertToFieldSignDto(documentVersionField);

			updatedDocumentBytes = updateDocumentAfterFieldVerification(documentVersionField, keyPairSign, fieldSignDto,
					documentBytes);
		}

		String fileUrl = uploadProcessedDocumentVersion(updatedDocumentBytes);

		// Create new version with signature
		DocumentVersion newVersion = createNewDocumentVersion(documentSignDto, currentVersion, fileUrl,
				keyPairSign.getPrivate(), currentAddressBookUser, updatedDocumentBytes);

		newVersion = documentVersionRepository.save(newVersion);

		List<FieldSignDto> fieldSignDtoList = documentSignDto.getFieldSignDtoList();

		if (fieldSignDtoList != null) {
			List<DocumentVersionField> versionFields = getDocumentVersionFields(fieldSignDtoList, newVersion);

			documentVersionFieldRepository.saveAll(versionFields);
		}

		// save document on current version
		document.setCurrentVersion(newVersion.getVersionNumber());
		document.setCurrentSignOderNumber(document.getCurrentSignOderNumber() + 1);
		document = documentRepository.save(document);

		List<Recipient> nextSignRecipientList = recipientService
			.getNextSignRecipientData(Optional.ofNullable(updatedRecipient.getId()), document.getEnvelope().getId());

		if (isDocumentComplete(nextSignRecipientList)) {

			// sign the document by sender and create new document version
			DocumentVersion documentVersion = verifyDocumentVersionsRelatedToDocument(document, newVersion);
			documentVersionRepository.save(documentVersion);
			document.setCurrentVersion(documentVersion.getVersionNumber());
			documentRepository.save(document);

			Envelope envelope = document.getEnvelope();
			envelope.setStatus(EnvelopeStatus.COMPLETED);
			envelope.setCompletedAt(getCurrentUtcDateTime());
			envelopeDao.save(envelope);

			// send email to all recipients in envelope
			// send sender email
		}

		return new ResponseEntityDto(false, "New Document version successfully created");

	}

	private String uploadProcessedDocumentVersion(byte[] updatedDocumentBytes) {
		String fileUrl = EsignUtil.generateFileUrl();

		try (InputStream inputStream = new ByteArrayInputStream(updatedDocumentBytes)) {
			amazonS3Service.uploadFile(bucketName, fileUrl, inputStream);
		}
		catch (IOException e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_UPLOAD_FILE);
		}
		return fileUrl;
	}

	@Override
	@Transactional
	public ResponseEntityDto sequentialSignField(DocumentFieldSignDto documentFieldSignDto) {
		User currentUser = userService.getCurrentUser();

		validateDocumentFieldSignRequest(documentFieldSignDto);

		AddressBook currentAddressBookUser = getAddressBookIdByInternalUserId(currentUser);

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

		if (document.getCurrentSignOderNumber() != recipient.getSigningOrder()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_INVALID_SIGN_ORDER_RECIPIENT);
		}

		DocumentVersion currentVersion = getDocumentVersion(document.getCurrentVersion(),
				documentFieldSignDto.getDocumentId());

		KeyPair keyPairSign = loadKeyPair(currentAddressBookUser.getId());

		DocumentVersionField documentVersionField = processFieldSign(documentFieldSignDto, keyPairSign.getPrivate(),
				currentVersion);

		documentVersionFieldRepository.save(documentVersionField);

		Field field = documentVersionField.getField();
		field.setStatus(FieldStatus.FILLED);
		fieldRepository.save(field);

		return new ResponseEntityDto(false, "New Document Field Version successfully created");

	}

	private DocumentVersion verifyDocumentVersionsRelatedToDocument(Document document, DocumentVersion currentVersion) {

		List<DocumentVersion> documentVersions = document.getVersions();
		documentVersions.forEach(documentVersion -> {
			UserKey userKey = userKeyService.getKeyPairByAddressBookId(documentVersion.getAddressBook().getId());
			PublicKey publicKey = convertToPublicKey(userKey.getPublicKey());
			byte[] documentBytes = amazonS3Service.downloadFileAsBytes(bucketName, documentVersion.getFilePath());

			verifyDocumentSignature(documentBytes, documentVersion, publicKey);
		});

		KeyPair keyPair = loadKeyPair(document.getEnvelope().getOwner().getId());

		byte[] latestDocumentBytes = amazonS3Service.downloadFileAsBytes(bucketName, currentVersion.getFilePath());

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

		recipientService.sendEmailToNextRecipients(nextSignRecipientList);

		return !containsSigner;
	}

	private byte[] updateDocumentAfterFieldVerification(DocumentVersionField documentVersionField, KeyPair keyPairSign,
			FieldSignDto fieldSignDto, byte[] documentBytes) {
		return switch (documentVersionField.getField().getType()) {
			case DATE, APPROVE, DECLINE -> {
				verifyTextField(documentVersionField.getValue(), keyPairSign.getPublic(),
						documentVersionField.getFieldSignature());
				yield documentProcessingService.mergeTextFieldToDocument(fieldSignDto, documentBytes);

			}
			case SIGNATURE, INITIAL, STAMP -> {
				try (InputStream imageStream = amazonS3Service.downloadFile(bucketName,
						documentVersionField.getValue());
						ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

					imageStream.transferTo(outputStream);
					byte[] imageBytes = outputStream.toByteArray();

					verifyImageField(imageBytes, keyPairSign.getPublic(), documentVersionField.getFieldSignature());
					yield documentProcessingService.mergeImageFieldToDocument(fieldSignDto, documentBytes, imageBytes);
				}
				catch (Exception ex) {
					log.error("Failed to load image - updateDocumentAfterFieldVerification : {}",
							documentVersionField.getValue(), ex);
					throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_LOAD_IMAGE,
							new String[] { documentVersionField.getValue() });
				}
			}
		};
	}

	private DocumentVersionFieldBulk processFieldLevelSign(DocumentSignDto documentSignDto, PrivateKey privateKey,
			DocumentVersion documentVersion) {
		List<DocumentVersionField> documentVersionFields = new ArrayList<>();
		List<Field> fields = new ArrayList<>();

		documentSignDto.getFieldSignDtoList().forEach(fieldSignDto -> {

			DocumentFieldSignDto documentFieldSignDto = new DocumentFieldSignDto();
			documentFieldSignDto.setFieldSignDto(fieldSignDto);
			documentFieldSignDto.setDocumentId(documentSignDto.getDocumentId());
			documentFieldSignDto.setEnvelopeId(documentSignDto.getEnvelopeId());
			documentFieldSignDto.setRecipientId(documentSignDto.getRecipientId());

			DocumentVersionField documentVersionField = processFieldSign(documentFieldSignDto, privateKey,
					documentVersion);

			documentVersionFields.add(documentVersionField);

			Field field = documentVersionField.getField();
			field.setStatus(FieldStatus.FILLED);
			fields.add(field);
		});
		return new DocumentVersionFieldBulk(documentVersionFields, fields);
	}

	private DocumentVersionField processFieldSign(DocumentFieldSignDto documentFieldSignDto, PrivateKey privateKey,
			DocumentVersion currentVersion) {

		Field field = fieldRepository.findById(documentFieldSignDto.getFieldSignDto().getFieldId())
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_FIELD_ID_NOT_FOUND));

		if (!field.getRecipient().getId().equals(documentFieldSignDto.getRecipientId())) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_NOT_VALID_RECIPIENT_FOR_ENVELOPE);
		}

		if (!field.getDocument().getId().equals(documentFieldSignDto.getDocumentId())) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_NOT_FOUND);
		}

		FieldSignDto fieldSignDto = documentFieldSignDto.getFieldSignDto();

		return createSignedField(fieldSignDto, privateKey, field, currentVersion);
	}

	private DocumentVersionField signFieldVersion(FieldSignDto fieldSignDto, PrivateKey privateKey) {
		return switch (fieldSignDto.getType()) {
			case DATE, APPROVE, DECLINE -> signTextField(fieldSignDto, privateKey);
			case SIGNATURE, INITIAL, STAMP -> signImageField(fieldSignDto, privateKey);
		};
	}

	private List<DocumentVersionField> getDocumentVersionFields(List<FieldSignDto> fieldSignDtoList,
			DocumentVersion newVersion) {
		List<Field> fields = getFieldsFromFieldSignDtoList(fieldSignDtoList);
		return fields.stream().map(field -> {
			DocumentVersionField versionField = new DocumentVersionField();
			versionField.setField(field);
			versionField.setDocumentVersion(newVersion);

			fieldSignDtoList.stream()
				.filter(dto -> dto.getFieldId().equals(field.getId()))
				.findFirst()
				.ifPresent(fieldSignDto -> versionField.setValue(fieldSignDto.getFieldValue()));

			return versionField;
		}).toList();
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

	private KeyPair loadKeyPair(Long addressBookId) {
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

	private void verifyDocumentSignature(byte[] documentBytes, DocumentVersion currentVersion, PublicKey publicKey) {
		String currentHash = hashDocument(new ByteArrayInputStream(documentBytes));
		byte[] decodedHash = Base64.getDecoder().decode(currentHash);

		if (!verifySignature(decodedHash, currentVersion.getSignatures().getSignature(), publicKey)) {
			throw new ModuleException(EsignMessageConstant.ESIGN_VALIDATION_DOCUMENT_CONTENT_CHANGED);
		}
	}

	private String signDocument(byte[] documentHash, PrivateKey privateKey) {
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

	private String hashDocument(InputStream file) {
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

	private String hashDocument(String data) {
		try {
			MessageDigest digest = new SHA3.Digest256(); // Using SHA-3 for strong
															// security
			byte[] hashBytes = digest.digest(data.getBytes(StandardCharsets.UTF_8));
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

	private DocumentVersionField signImageField(FieldSignDto field, PrivateKey privateKey) {
		try (InputStream imageStream = amazonS3Service.downloadFile(bucketName, field.getFieldValue());
				ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

			imageStream.transferTo(outputStream);
			byte[] imageBytes = outputStream.toByteArray();

			String newHash = hashDocument(imageBytes);

			String signature = signDocument(Base64.getDecoder().decode(newHash), privateKey);
			return getDocumentVersionField(newHash, signature);
		}
		catch (Exception e) {
			log.error("Failed to load image: {}", field.getFieldValue(), e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_LOAD_IMAGE,
					new String[] { field.getFieldValue() });
		}
	}

	private DocumentVersionField signTextField(FieldSignDto field, PrivateKey privateKey) {
		try {
			String newHash = hashDocument(field.getFieldValue());
			String signature = signDocument(Base64.getDecoder().decode(newHash), privateKey);
			return getDocumentVersionField(newHash, signature);
		}
		catch (Exception e) {
			log.error("Failed to load image: {}", field.getFieldValue(), e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_LOAD_IMAGE,
					new String[] { field.getFieldValue() });
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
		String currentHash = hashDocument(data);
		byte[] decodedHash = Base64.getDecoder().decode(currentHash);

		if (!verifySignature(decodedHash, base64Signature, publicKey)) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FIELD_CONTENT_CHANGED);
		}

	}

	private DocumentVersion getDocumentVersion(int versionNumber, Long documentId) {
		return documentVersionRepository.findByVersionNumberAndDocumentId(versionNumber, documentId)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_VERSION_NOT_FOUND));
	}

	private List<Field> getFieldsFromFieldSignDtoList(List<FieldSignDto> fieldSignDtoList) {
		List<Long> fieldIds = fieldSignDtoList.stream().map(FieldSignDto::getFieldId).toList();
		return fieldRepository.findByIdIn(fieldIds);
	}

	private AddressBook getAddressBookIdByInternalUserId(@NotNull User currentUser) {

		return addressBookDao.findByInternalUser(currentUser)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_ID_NOT_FOUND,
					new String[] { currentUser.getUserId().toString() }));
	}

	private Recipient getRecipientById(@NotNull Long id) {

		return recipientRepository.findById(id)
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

	private DocumentVersionField getDocumentVersionField(String newHash, String signature) {
		DocumentVersionField documentVersionField = new DocumentVersionField();
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

	private DocumentVersion buildNewDocumentVersion(DocumentVersion currentVersion, String filePath, String hash,
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

	private DocumentVersionField createSignedField(FieldSignDto fieldSignDto, PrivateKey privateKey, Field field,
			DocumentVersion currentVersion) {

		DocumentVersionField documentVersionField = signFieldVersion(fieldSignDto, privateKey);

		documentVersionField.setField(field);
		documentVersionField.setXPosition(fieldSignDto.getXposition());
		documentVersionField.setYPosition(fieldSignDto.getYposition());
		documentVersionField.setValue(fieldSignDto.getFieldValue());
		documentVersionField.setWidth(fieldSignDto.getWidth());
		documentVersionField.setHeight(fieldSignDto.getHeight());
		documentVersionField.setDocumentVersion(currentVersion);

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

	private record DocumentVersionFieldBulk(List<DocumentVersionField> documentVersionFields, List<Field> fields) {
	}

}
