package com.skapp.enterprise.esignature.exception;

/**
 * Exception thrown when PDF signing operations fail.
 *
 * This is a high-level exception that wraps lower-level failures from: - PDF manipulation
 * (PDFBox) - Signature provider operations - Certificate provider operations - S3 storage
 * operations - Database operations
 */
public class PdfSigningException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	public PdfSigningException(String message) {
		super(message);
	}

	public PdfSigningException(String message, Throwable cause) {
		super(message, cause);
	}

	public PdfSigningException(Throwable cause) {
		super(cause);
	}

}
