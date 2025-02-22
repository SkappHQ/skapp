package com.skapp.enterprise.esignature.payload.response;

import java.io.InputStream;

public class ProcessedDocumentResult {

	private final InputStream processedDocument;

	private final String fileUrl;

	public ProcessedDocumentResult(InputStream processedDocument, String fileUrl) {
		this.processedDocument = processedDocument;
		this.fileUrl = fileUrl;
	}

	public InputStream getProcessedDocument() {
		return processedDocument;
	}

	public String getFileUrl() {
		return fileUrl;
	}

}
