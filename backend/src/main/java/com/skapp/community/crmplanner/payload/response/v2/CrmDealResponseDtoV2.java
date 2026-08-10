package com.skapp.community.crmplanner.payload.response.v2;

import com.skapp.community.crmplanner.payload.response.CrmCompanyResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmDealStageResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmOwnerResponseDto;
import com.skapp.community.crmplanner.type.CrmDealPriority;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CrmDealResponseDtoV2 {

	private Long id;

	private String name;

	private String description;

	private CrmDealPriority priority;

	private String orderIndex;

	private String amount;

	private LocalDateTime closingAt;

	private CrmDealStageResponseDto stage;

	private CrmOwnerResponseDto owner;

	private CrmCompanyResponseDto company;

	private CrmContactResponseDtoV2 contact;

}
