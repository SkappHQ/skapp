package com.skapp.enterprise.invoice.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectSummaryResponseDto {

	private Long projectId;

	private String projectKey;

	private String projectName;

	private int memberCount;

}
