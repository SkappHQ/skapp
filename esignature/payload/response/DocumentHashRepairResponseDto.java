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

	private int skipped;

	private int failed;

	private List<String> details = new ArrayList<>();

	public void addDetail(String message) {
		this.details.add(message);
	}

}
