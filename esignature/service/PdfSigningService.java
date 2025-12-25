package com.skapp.enterprise.esignature.service;

import com.skapp.enterprise.esignature.exception.PdfSigningException;
import com.skapp.enterprise.esignature.model.DocumentVersion;

/**
 * Service interface for PDF digital signing operations.
 *
 * This service orchestrates the complete PDF signing workflow: 1. Accept PDF bytes
 * (already in memory from document completion flow) 2. Prepare signature payload (hash of
 * PDF byte ranges) 3. Sign with SignatureProvider (local or cloud HSM) 4. Embed signature
 * in PDF (PAdES baseline) 5. Upload signed PDF to S3 6. Update database with signature
 * metadata
 *
 * The service is implementation-agnostic and works with any SignatureProvider
 * implementation (local keystore, Azure Key Vault, AWS CloudHSM, etc.).
 */
public interface PdfSigningService {

	/**
	 * Sign a completed PDF document with the organization's certificate.
	 *
	 * This method is called when an envelope reaches COMPLETED status (all recipients
	 * have signed). It creates a cryptographically verifiable PDF signature that can be
	 * validated by third-party tools like Adobe Acrobat Reader.
	 *
	 * The signing process: 1. Validates that the document version exists 2. Loads PDF
	 * from provided bytes (avoids extra S3 download) 3. Calculates hash of PDF byte
	 * ranges 4. Signs hash using SignatureProvider 5. Embeds signature in PDF with
	 * certificate chain 6. Uploads signed PDF to S3 (separate path for completed
	 * documents) 7. Updates DocumentVersion with signature metadata 8. Creates audit
	 * trail entry
	 * @param documentVersionId The ID of the final document version to sign
	 * @param pdfBytes The PDF document bytes (already loaded in completion workflow)
	 * @return Updated DocumentVersion entity with signature information and signed PDF
	 * bytes
	 * @throws PdfSigningException if any step of the signing process fails
	 */
	DocumentVersion signCompletedDocument(Long documentVersionId, byte[] pdfBytes) throws PdfSigningException;

	/**
	 * Check if PDF signing feature is enabled.
	 *
	 * This allows callers to conditionally execute signing logic based on configuration.
	 * If disabled, the document completion workflow will skip PDF signing.
	 * @return true if feature is enabled in configuration
	 */
	boolean isSigningEnabled();

}
