package com.skapp.enterprise.esignature.service.impl;

import com.skapp.enterprise.common.service.AmazonS3Service;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.DocumentSignature;
import com.skapp.enterprise.esignature.model.DocumentVersion;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.payload.response.DocumentHashRepairResponseDto;
import com.skapp.enterprise.esignature.repository.DocumentVersionDao;
import com.skapp.enterprise.esignature.service.DocumentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.KeyPair;
import java.util.Base64;

/**
 * Handles the repair of a single document's hash and signature in its own transaction, so
 * that a failure for one document does not roll back repairs for other documents.
 * <p>
 * Reuses {@link DocumentService#verifyDocumentSignature} to detect mismatches,
 * {@link DocumentService#hashDocument} to recompute the hash,
 * {@link DocumentService#signDocument} to recompute the signature, and
 * {@link DocumentService#loadKeyPair} to load the owner's key pair.
 * <p>
 * Extracted into a separate Spring bean so that {@link Transactional} is honoured when
 * called from {@link EsMigrationServiceImpl} (avoids self-invocation proxy bypass).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DocumentHashRepairProcessor {

	private static final String LOG_PREFIX = "[EsMigration]";

	private final DocumentVersionDao documentVersionDao;

	private final AmazonS3Service amazonS3Service;

	private final DocumentService documentService;

	@Value("${aws.s3.bucket-name}")
	private String bucketName;

	// -------------------------------------------------------------------------
	// Main entry point — each document gets its own transaction
	// -------------------------------------------------------------------------

	/**
	 * Repair a single document's current-version hash and signature. Runs in its own
	 * transaction ({@link Propagation#REQUIRES_NEW}) so a failure for one document does
	 * not affect others.
	 */
	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void repairDocument(Envelope envelope, Document document, DocumentHashRepairResponseDto response) {
		String docLabel = buildLabel(envelope, document);
		try {
			// 1. Resolve current version
			DocumentVersion version = resolveCurrentVersion(document, docLabel, response);
			if (version == null) {
				return;
			}

			// 2. Download file from S3
			byte[] fileBytes = downloadFile(version, docLabel, response);
			if (fileBytes == null) {
				return;
			}

			// 3. Load the envelope owner's key pair (needed for both verify and re-sign)
			KeyPair keyPair = loadKeyPairForEnvelope(envelope, docLabel, response);
			if (keyPair == null) {
				return;
			}

			// 4. Verify integrity using the existing service method.
			// verifyDocumentSignature computes hashDocument internally and calls
			// verifySignature — throws ModuleException on mismatch.
			boolean integrityOk = checkIntegrity(fileBytes, version, keyPair, docLabel);

			if (integrityOk) {
				recordOk(docLabel, response);
				return;
			}

			// 5. Mismatch detected — recompute hash and signature using existing methods
			log.info("{} Integrity mismatch for {}; recalculating hash and signature.", LOG_PREFIX, docLabel);

			String freshHash = documentService.hashDocument(new ByteArrayInputStream(fileBytes));
			String freshSignature = documentService.signDocument(Base64.getDecoder().decode(freshHash),
					keyPair.getPrivate());

			// 6. Persist updated values
			version.setDocumentHash(freshHash);

			DocumentSignature sig = version.getSignatures();
			if (sig == null) {
				sig = new DocumentSignature();
				version.setSignatures(sig);
			}
			sig.setSignature(freshSignature);

			documentVersionDao.saveAndFlush(version);

			log.info("{} Repaired {}", LOG_PREFIX, docLabel);
			response.setRepaired(response.getRepaired() + 1);

		}
		catch (Exception e) {
			log.error("{} Failed to repair {}: {}", LOG_PREFIX, docLabel, e.getMessage(), e);
			response.addFailedDocumentId(document.getId());
			response.setFailed(response.getFailed() + 1);
		}
	}

	/**
	 * Use {@link DocumentService#verifyDocumentSignature} to check hash + signature.
	 * Returns {@code true} if integrity is confirmed, {@code false} if a mismatch is
	 * detected (i.e., the method throws).
	 * <p>
	 * If the version has no signature stored, falls back to a plain hash comparison via
	 * {@link DocumentService#hashDocument}.
	 */
	private boolean checkIntegrity(byte[] fileBytes, DocumentVersion version, KeyPair keyPair, String docLabel) {
		if (version.getSignatures() != null && version.getSignatures().getSignature() != null) {
			try {
				// Reuse the existing integrity check: computes hash + verifies ECDSA sig.
				// verifyDocumentSignature internally computes a fresh hash and checks
				// it against the stored signature, but does NOT compare it against
				// version.getDocumentHash(). We therefore perform that check explicitly
				// so a stale/corrupted stored hash is also caught and repaired.
				documentService.verifyDocumentSignature(fileBytes, version, keyPair.getPublic());
			}
			catch (Exception e) {
				log.debug("{} verifyDocumentSignature failed for {}: {}", LOG_PREFIX, docLabel, e.getMessage());
				return false;
			}

			// Signature verified — now also confirm the persisted hash matches
			String freshHash = documentService.hashDocument(new ByteArrayInputStream(fileBytes));
			boolean hashOk = freshHash.equals(version.getDocumentHash());
			if (!hashOk) {
				log.debug("{} Signature OK but stored hash is stale for {}", LOG_PREFIX, docLabel);
			}
			return hashOk;
		}

		// No signature on record — just compare the stored hash against a fresh one
		String freshHash = documentService.hashDocument(new ByteArrayInputStream(fileBytes));
		boolean hashOk = freshHash.equals(version.getDocumentHash());
		if (!hashOk) {
			log.debug("{} Hash-only mismatch for {}", LOG_PREFIX, docLabel);
		}
		return hashOk;
	}

	private DocumentVersion resolveCurrentVersion(Document document, String docLabel,
			DocumentHashRepairResponseDto response) {
		DocumentVersion version = documentVersionDao
			.findByVersionNumberAndDocumentId(document.getCurrentVersion(), document.getId())
			.orElse(null);

		if (version == null) {
			log.warn("{} No current version found for {}", LOG_PREFIX, docLabel);
			response.setSkipped(response.getSkipped() + 1);
			return null;
		}

		if (version.getFilePath() == null || version.getFilePath().isBlank()) {
			log.warn("{} Blank file path for {}", LOG_PREFIX, docLabel);
			response.setSkipped(response.getSkipped() + 1);
			return null;
		}

		return version;
	}

	private byte[] downloadFile(DocumentVersion version, String docLabel, DocumentHashRepairResponseDto response) {
		try (InputStream inputStream = amazonS3Service.downloadFile(bucketName, version.getFilePath())) {
			if (inputStream == null) {
				log.warn("{} Empty S3 file for {}", LOG_PREFIX, docLabel);
				response.setSkipped(response.getSkipped() + 1);
				return null;
			}

			byte[] fileBytes = inputStream.readAllBytes();
			if (fileBytes.length == 0) {
				log.warn("{} Empty S3 file for {}", LOG_PREFIX, docLabel);
				response.setSkipped(response.getSkipped() + 1);
				return null;
			}
			return fileBytes;
		}
		catch (IOException e) {
			log.error("{} Failed to download S3 file for {}: {}", LOG_PREFIX, docLabel, e.getMessage(), e);
			response.setSkipped(response.getSkipped() + 1);
			return null;
		}
	}

	private KeyPair loadKeyPairForEnvelope(Envelope envelope, String docLabel, DocumentHashRepairResponseDto response) {
		try {
			if (envelope.getOwner() == null) {
				log.warn("{} Envelope owner is null for {}", LOG_PREFIX, docLabel);
				response.setSkipped(response.getSkipped() + 1);
				return null;
			}
			// Reuse DocumentService.loadKeyPair — handles AES decryption of stored key
			return documentService.loadKeyPair(envelope.getOwner().getId());
		}
		catch (Exception e) {
			log.error("{} Failed to load key pair for {}: {}", LOG_PREFIX, docLabel, e.getMessage(), e);
			response.setSkipped(response.getSkipped() + 1);
			return null;
		}
	}

	private void recordOk(String docLabel, DocumentHashRepairResponseDto response) {
		log.debug("{} Integrity OK for {}", LOG_PREFIX, docLabel);
		response.setSkipped(response.getSkipped() + 1);
	}

	private static String buildLabel(Envelope envelope, Document document) {
		return "envelope=" + envelope.getId() + " / document=" + document.getId();
	}

}
