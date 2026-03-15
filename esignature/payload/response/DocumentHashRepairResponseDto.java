package com.skapp.enterprise.esignature.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class DocumentHashRepairResponseDto {

	private String tenant;

	private int totalEnvelopes;

	private int totalDocuments;

	private int repaired;

	private List<Long> repairedDocumentIds = new ArrayList<>();

	private int skipped;

	private List<Long> skippedDocumentIds = new ArrayList<>();

	private int failed;

	private List<Long> failedDocumentIds = new ArrayList<>();

	public void addRepairedDocumentId(Long documentId) {
		this.repairedDocumentIds.add(documentId);
	}

	public void addSkippedDocumentId(Long documentId) {
		this.skippedDocumentIds.add(documentId);
	}

	public void addFailedDocumentId(Long documentId) {
		this.failedDocumentIds.add(documentId);
	}

}
