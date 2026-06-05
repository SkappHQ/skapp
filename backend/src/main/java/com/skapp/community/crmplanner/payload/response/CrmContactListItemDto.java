package com.skapp.community.crmplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class CrmContactListItemDto {

	private Long id;

	private String name;

	private String email;

	private String contactNumber;

	private LocalDateTime lastContactAt;

	private CrmCompanyLookupResponseDto company;

	private CrmContactOwnerResponseDto owner;

	private BigDecimal closedDealValue;

	private Long closedDealCount;

	private Long openTaskCount;

	private Long overdueTaskCount;

}
