package com.skapp.community.crmplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class CrmContactDetailResponseDto {

	private Long id;

	private String name;

	private String email;

	private String contactNumber;

	private LocalDateTime lastModifiedDate;

	private CrmCompanyLookupResponseDto company;

	private CrmOwnerResponseDto owner;

	private String totalRevenue;

	private String pipelineRevenue;

	private long activeDealsCount;

	private long openTasksCount;

	private long overdueTasksCount;

	private List<CrmDealDetailResponseDto> deals;

	private List<CrmTaskDetailResponseDto> tasks;

}
