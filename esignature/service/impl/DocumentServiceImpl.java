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
import com.skapp.enterprise.esignature.model.Field;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.model.UserKey;
import com.skapp.enterprise.esignature.payload.request.DocumentDto;
import com.skapp.enterprise.esignature.payload.request.DocumentSignDto;
import com.skapp.enterprise.esignature.payload.request.FieldSignDto;
import com.skapp.enterprise.esignature.payload.response.DocumentDetailResponseDto;
import com.skapp.enterprise.esignature.repository.AddressBookDao;
import com.skapp.enterprise.esignature.repository.DocumentRepository;
import com.skapp.enterprise.esignature.repository.DocumentVersionFieldRepository;
import com.skapp.enterprise.esignature.repository.DocumentVersionRepository;
import com.skapp.enterprise.esignature.repository.FieldRepository;
import com.skapp.enterprise.esignature.repository.RecipientRepository;
import com.skapp.enterprise.esignature.security.AESKeyLoader;
import com.skapp.enterprise.esignature.service.DocumentProcessingService;
import com.skapp.enterprise.esignature.service.DocumentService;
import com.skapp.enterprise.esignature.service.UserKeyService;
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

	private final UserService userService;

	private final UserKeyService userKeyService;

	private final AmazonS3Service amazonS3Service;

	private final DocumentProcessingService documentProcessingService;

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
				.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_ID_NOT_FOUND));

			DocumentVersion currentVersion = getDocumentVersionObj(document);

			return createNewDocumentVersion(documentSignDto, currentVersion, keyPair.getPrivate(), true,
					currentAddressBookUser);
		}
		catch (Exception e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_SIGN_DOCUMENT,
					new String[] { e.getMessage() });
		}
	}

	@Override
	@Transactional
	public ResponseEntityDto signDocumentInOrder(DocumentSignDto documentSignDto) {

		User currentUser = userService.getCurrentUser();

		AddressBook currentAddressBookUser = getAddressBookIdByInternalUserId(currentUser);

		validateDocumentSignRequest(documentSignDto);

		// TODO:signing order id validation

		Recipient recipient = getRecipientById(documentSignDto.getRecipientId());

		if (!recipient.getAddressBook().getId().equals(currentAddressBookUser.getId())) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_CURRENT_USER_NOT_MATCH);
		}

		Document document = documentRepository.findById(documentSignDto.getDocumentId())
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_ID_NOT_FOUND));

		DocumentVersion currentVersion = getDocumentVersion(document.getCurrentVersion(),
				documentSignDto.getDocumentId());

		// Load and validate keys-load previous user keys
		KeyPair keyPairVerify = loadKeyPair(currentVersion.getAddressBook().getId());

		// Process document version and verify existing signature
		processAndVerifyCurrentVersion(currentVersion, keyPairVerify.getPublic());

		// current user key pair for sign document
		KeyPair keyPairSign = loadKeyPair(currentAddressBookUser.getId());

		// Create new version with signature
		DocumentVersion newVersion = createNewDocumentVersion(documentSignDto, currentVersion, keyPairSign.getPrivate(),
				false, currentAddressBookUser);

		newVersion = documentVersionRepository.save(newVersion);

		List<FieldSignDto> fieldSignDtoList = documentSignDto.getFieldSignDtoList();

		if (fieldSignDtoList != null) {
			List<Field> fields = getFieldsFromFieldSignDtoList(fieldSignDtoList);
			DocumentVersion finalNewVersion = newVersion;
			List<DocumentVersionField> versionFields = fields.stream().map(field -> {
				DocumentVersionField versionField = new DocumentVersionField();
				versionField.setField(field);
				versionField.setDocumentVersion(finalNewVersion);

				fieldSignDtoList.stream()
					.filter(dto -> dto.getFieldId().equals(field.getId()))
					.findFirst()
					.ifPresent(fieldSignDto -> versionField.setValue(fieldSignDto.getFieldValue()));

				return versionField;
			}).toList();

			documentVersionFieldRepository.saveAll(versionFields);

		}

		// save document on current version
		document.setCurrentVersion(newVersion.getVersionNumber());
		documentRepository.save(document);

		return new ResponseEntityDto(false, "New Document version successfully created");

	}

	private void validateDocumentSignRequest(@NotNull DocumentSignDto request) {

		if (request.getDocumentId() == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_ID_NOT_FOUND);
		}

		if (request.getFieldSignDtoList() == null || request.getFieldSignDtoList().isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_EMPTY_FIELD_SIGN_LIST);
		}

		if (request.getRecipientId() == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_ID_NOT_FOUND);
		}
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

	private DocumentVersion getDocumentVersion(int versionNumber, Long documentId) {
		return documentVersionRepository.findByVersionNumberAndDocumentId(versionNumber, documentId)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_VERSION_NOT_FOUND));
	}

	private void processAndVerifyCurrentVersion(DocumentVersion currentVersion, PublicKey publicKey) {

		try (InputStream documentStream = amazonS3Service.downloadFile(bucketName, currentVersion.getFilePath())) {
			String currentHash = hashDocument(documentStream);
			byte[] decodedHash = Base64.getDecoder().decode(currentHash);

			if (!verifySignature(decodedHash, currentVersion.getSignatures().getSignature(), publicKey)) {
				throw new ModuleException(EsignMessageConstant.ESIGN_VALIDATION_DOCUMENT_CONTENT_CHANGED);
			}

		}
		catch (IOException e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_PROCESS_CURRENT_DOCUMENT_VERSION,
					new String[] { e.getMessage() });
		}
	}

	private DocumentVersion createNewDocumentVersion(DocumentSignDto signDto, DocumentVersion currentVersion,
			PrivateKey privateKey, Boolean isVersionFirst, AddressBook addressBook) {

		try (InputStream documentStream = amazonS3Service.downloadFile(bucketName, currentVersion.getFilePath())) {
			String fileUrl = currentVersion.getFilePath();
			byte[] documentBytes;

			if (Boolean.FALSE.equals(isVersionFirst)) {
				try (InputStream processedStream = documentProcessingService.mergeFields(signDto.getFieldSignDtoList(),
						documentStream); ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream()) {

					processedStream.transferTo(byteArrayOutputStream);
					documentBytes = byteArrayOutputStream.toByteArray();
				}

				fileUrl = EsignUtil.generateFileUrl();

				try (InputStream uploadStream = new ByteArrayInputStream(documentBytes)) {
					amazonS3Service.uploadFile(bucketName, fileUrl, uploadStream);
				}
			}
			else {
				try (ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream()) {
					documentStream.transferTo(byteArrayOutputStream);
					documentBytes = byteArrayOutputStream.toByteArray();
				}
			}

			String newHash;
			try (InputStream hashStream = new ByteArrayInputStream(documentBytes)) {
				newHash = hashDocument(hashStream);
			}

			String signature = signDocument(Base64.getDecoder().decode(newHash), privateKey);

			if (signDto.getFieldSignDtoList() == null) {
				signDto.setFieldSignDtoList(new ArrayList<>());
			}

			return buildNewDocumentVersion(currentVersion, fileUrl, newHash, signature, addressBook);
		}
		catch (IOException e) {
			log.error("Error creating new Document version", e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_CREATE_NEW_DOCUMENT_VERSION);
		}
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

	private List<Field> getFieldsFromFieldSignDtoList(List<FieldSignDto> fieldSignDtoList) {
		List<Long> fieldIds = fieldSignDtoList.stream().map(FieldSignDto::getFieldId).toList();
		return fieldRepository.findByIdIn(fieldIds);
	}

	private DocumentVersion getDocumentVersionObj(Document document) {
		DocumentVersion currentVersion = new DocumentVersion();
		currentVersion.setFilePath(document.getFilePath());
		currentVersion.setVersionNumber(0);
		currentVersion.setDocument(document);
		return currentVersion;
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

}
