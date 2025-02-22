package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.service.AmazonS3Service;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.mapper.EsignMapper;
import com.skapp.enterprise.esignature.model.*;
import com.skapp.enterprise.esignature.payload.request.*;
import com.skapp.enterprise.esignature.payload.response.DocumentDetailResponseDto;
import com.skapp.enterprise.esignature.payload.response.ProcessedDocumentResult;
import com.skapp.enterprise.esignature.repository.AddressBookDao;
import com.skapp.enterprise.esignature.repository.DocumentRepository;
import com.skapp.enterprise.esignature.repository.DocumentVersionFieldRepository;
import com.skapp.enterprise.esignature.repository.DocumentVersionRepository;
import com.skapp.enterprise.esignature.repository.FieldRepository;
import com.skapp.enterprise.esignature.security.AESKeyLoader;
import com.skapp.enterprise.esignature.service.*;
import com.skapp.enterprise.esignature.utill.decryptor.AESDecrypt;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bouncycastle.jcajce.provider.digest.SHA3;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

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

			if (documentSignDto.getAddressBookId() == null) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_MISSING_ADDRESS_BOOK_ID);
			}

			if (documentSignDto.getDocumentId() == null) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_ID_NOT_FOUND);
			}
			// Load and validate keys
			KeyPair keyPair = loadKeyPair(documentSignDto.getAddressBookId());

			Document document = documentRepository.findById(documentSignDto.getDocumentId())
				.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_ID_NOT_FOUND));

			AddressBook addressBook = addressBookDao.findById(documentSignDto.getAddressBookId())
				.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_MISSING_ADDRESS_BOOK_ID));

			DocumentVersion currentVersion = getDocumentVersionObj(document, addressBook);

			// Create new version with signature
			return createNewDocumentVersion(documentSignDto, currentVersion, keyPair.getPrivate(), true);
		}
		catch (Exception e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_SIGN_DOCUMENT,
					new String[] { e.getMessage() });
		}
	}

	@Override
	@Transactional
	public ResponseEntityDto signDocument(DocumentSignDto documentSignDto) {
		try {
			validateDocumentSignRequest(documentSignDto);

			// Load and validate keys
			KeyPair keyPair = loadKeyPair(documentSignDto.getAddressBookId());

			DocumentVersion currentVersion = getDocumentVersion(documentSignDto.getDocumentVersionId());
			// Process document version and verify existing signature
			processAndVerifyCurrentVersion(currentVersion, keyPair.getPublic());

			// Create new version with signature
			DocumentVersion newVersion = createNewDocumentVersion(documentSignDto, currentVersion, keyPair.getPrivate(),
					false);

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

			return new ResponseEntityDto(false, newVersion);
		}
		catch (Exception e) {
			log.error("Error signing document", e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_SIGN_DOCUMENT,
					new String[] { e.getMessage() });
		}
	}

	@Override
	public ResponseEntityDto mergeDocument(DocumentSignDto signDto) {
		try {
			String path = "original/ticket.pdf";
			try (InputStream documentStream = amazonS3Service.downloadFile(bucketName, path)) {

				ProcessedDocumentResult processedDoc = documentProcessingService
					.mergeFields(signDto.getFieldSignDtoList(), documentStream);
				InputStream finalDocumentStream = processedDoc.getProcessedDocument();
				String fileUrl = processedDoc.getFileUrl();

				amazonS3Service.uploadFile(bucketName, fileUrl, finalDocumentStream);

				return new ResponseEntityDto(false, "success");
			}
		}
		catch (Exception e) {
			log.error("Error signing document", e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_SIGN_DOCUMENT,
					new String[] { e.getMessage() });
		}
	}

	private void validateDocumentSignRequest(@NotNull DocumentSignDto request) {

		if (request.getDocumentVersionId() == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_MISSING_DOCUMENT_VERSION_ID);
		}
		if (request.getAddressBookId() == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_MISSING_ADDRESS_BOOK_ID);
		}
		if (request.getFieldSignDtoList() == null || request.getFieldSignDtoList().isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_EMPTY_FIELD_SIGN_LIST);
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

	private DocumentVersion getDocumentVersion(Long versionId) {
		return documentVersionRepository.findById(versionId)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_VERSION_NOT_FOUND));
	}

	private void processAndVerifyCurrentVersion(DocumentVersion currentVersion, PublicKey publicKey) {

		try (InputStream documentStream = amazonS3Service.downloadFile(bucketName, currentVersion.getFilePath())) {
			String currentHash = hashDocument(documentStream);
			byte[] decodedHash = Base64.getDecoder().decode(currentHash);

			if (!verifySignature(decodedHash, currentVersion.getSignatures().getSignature(), publicKey)) {
				throw new ModuleException(EsignMessageConstant.ESIGN_VALIDATION_DOCUMENT_FIELD_TYPE_INVALID);
			}

		}
		catch (IOException e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_PROCESS_CURRENT_DOCUMENT_VERSION,
					new String[] { e.getMessage() });
		}
	}

	private DocumentVersion createNewDocumentVersion(DocumentSignDto signDto, DocumentVersion currentVersion,
			PrivateKey privateKey, Boolean isVersionFirst) throws IOException {

		try (InputStream documentStream = amazonS3Service.downloadFile(bucketName, currentVersion.getFilePath())) {

			InputStream finalDocumentStream = documentStream;
			String fileUrl = currentVersion.getFilePath();

			if (Boolean.FALSE.equals(isVersionFirst)) {
				ProcessedDocumentResult processedDoc = documentProcessingService
					.mergeFields(signDto.getFieldSignDtoList(), documentStream);
				finalDocumentStream = processedDoc.getProcessedDocument();
				fileUrl = processedDoc.getFileUrl();

				amazonS3Service.uploadFile(bucketName, fileUrl, finalDocumentStream);
			}

			// Hash and sign new document
			String newHash = hashDocument(finalDocumentStream);
			String signature = signDocument(Base64.getDecoder().decode(newHash), privateKey);

			// Create new version entity
			if (signDto.getFieldSignDtoList() == null) {
				signDto.setFieldSignDtoList(new ArrayList<>());
			}

			return buildNewDocumentVersion(currentVersion, fileUrl, newHash, signature);
		}
	}

	private DocumentVersion buildNewDocumentVersion(DocumentVersion currentVersion, String filePath, String hash,
			String signature) {

		DocumentVersion newVersion = new DocumentVersion();
		newVersion.setDocument(currentVersion.getDocument());
		newVersion.setVersionNumber(currentVersion.getVersionNumber() + 1);
		newVersion.setAddressBook(currentVersion.getAddressBook());
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

	private DocumentVersion getDocumentVersionObj(Document document, AddressBook addressBook) {
		DocumentVersion currentVersion = new DocumentVersion();
		currentVersion.setFilePath(document.getFilePath());
		currentVersion.setVersionNumber(0);
		currentVersion.setDocument(document);
		currentVersion.setAddressBook(addressBook);
		return currentVersion;
	}

}
