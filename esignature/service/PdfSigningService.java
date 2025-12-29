package com.skapp.enterprise.esignature.service;

import com.skapp.enterprise.esignature.exception.PdfSigningException;
import com.skapp.enterprise.esignature.payload.response.SignedPdfResult;

/**
 * Service interface for PDF digital signing operations.
 *
 * This service orchestrates the complete PDF signing workflow: 1. Accept PDF bytes
 * (already in memory from document completion flow) 2. Prepare signature payload (hash of
 * PDF byte ranges) 3. Sign with SignatureProvider (local or cloud HSM) 4. Embed signature
 * in PDF (PAdES baseline)
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
	 * The signing process: 1. Loads PDF from provided bytes 2. Calculates hash of PDF byte
	 * ranges 3. Signs hash using SignatureProvider 4. Embeds signature in PDF with
	 * certificate chain
	 * @param pdfBytes The PDF document bytes (already loaded in completion workflow)
	 * @return SignedPdfResult containing signed PDF bytes and signature metadata
	 * @throws PdfSigningException if any step of the signing process fails
	 */
	SignedPdfResult signPdf(byte[] pdfBytes) throws PdfSigningException;

	/**
	 * Check if PDF signing feature is enabled.
	 *
	 * This allows callers to conditionally execute signing logic based on configuration.
	 * If disabled, the document completion workflow will skip PDF signing.
	 * @return true if feature is enabled in configuration
	 */
	boolean isSigningEnabled();

}
