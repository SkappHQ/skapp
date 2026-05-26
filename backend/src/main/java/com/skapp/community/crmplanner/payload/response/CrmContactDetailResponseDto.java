package com.skapp.community.crmplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
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

	private CrmContactOwnerResponseDto owner;

	private BigDecimal totalRevenue;

	private BigDecimal pipelineRevenue;

	private long activeDealsCount;

	private long openTasksCount;

	private long overdueTasksCount;

	private List<CrmDealDetailResponseDto> deals;

	private List<CrmTaskDetailResponseDto> tasks;

}
