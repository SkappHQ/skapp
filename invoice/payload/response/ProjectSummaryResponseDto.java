package com.skapp.enterprise.invoice.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class ProjectSummaryResponseDto {

	private Long projectId;

	private String projectKey;

	private String projectName;

	private int memberCount;

	private List<ProjectAdminResponseDto> admins;

	private LocalDate lastInvoiceDate;

}
