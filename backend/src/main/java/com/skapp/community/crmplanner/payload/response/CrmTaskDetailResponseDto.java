package com.skapp.community.crmplanner.payload.response;

import com.skapp.community.crmplanner.type.CrmTaskPriority;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CrmTaskDetailResponseDto {

	private Long id;

	private String name;

	private String typeName;

	private CrmTaskPriority priority;

	private LocalDateTime dueAt;

	private Boolean isCompleted;

	private CrmOwnerResponseDto owner;

	private CrmContactLookupResponseDto contact;

	private CrmDealLookupResponseDto deal;

}
