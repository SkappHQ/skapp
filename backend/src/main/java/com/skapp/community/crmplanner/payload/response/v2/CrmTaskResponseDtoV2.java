package com.skapp.community.crmplanner.payload.response.v2;

import com.skapp.community.crmplanner.payload.response.CrmCompanyResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmOwnerResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmTaskTypeResponseDto;
import com.skapp.community.crmplanner.type.CrmTaskPriority;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CrmTaskResponseDtoV2 {

	private Long id;

	private String name;

	private Long typeId;

	private CrmTaskPriority priority;

	private Boolean isCompleted;

	private LocalDateTime dueAt;

	private LocalDateTime lastModifiedDate;

	private String notes;

	private Long ownerId;

	private Long contactId;

	private CrmCompanyResponseDto company;

	private Long dealId;

}
