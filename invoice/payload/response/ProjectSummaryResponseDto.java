package com.skapp.enterprise.invoice.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ProjectSummaryResponseDto {

	private Long projectId;

	private String projectKey;

	private String projectName;

	private int memberCount;

	private String adminName;

	private LocalDate lastInvoiceDate;

}
