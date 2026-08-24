package com.skapp.community.crmplanner.payload.response.v2;

import com.skapp.community.crmplanner.type.CrmDealPriority;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CrmDealResponseDtoV2 {

	private Long id;

	private String name;

	private String description;

	private CrmDealPriority priority;

	private String orderIndex;

	private String amount;

	private LocalDateTime closingAt;

	private Long stageId;

	private Long ownerId;

	private Long companyId;

	private Long contactId;

}
