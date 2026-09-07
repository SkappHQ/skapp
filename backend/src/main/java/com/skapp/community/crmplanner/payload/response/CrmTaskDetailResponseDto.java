package com.skapp.community.crmplanner.payload.response;

import com.skapp.community.crmplanner.type.CrmTaskPriority;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class CrmTaskDetailResponseDto {

	private Long id;

	private String name;

	private String typeName;

	private CrmTaskPriority priority;

	private Instant dueAt;

	private Boolean isCompleted;

	private CrmOwnerResponseDto owner;

	private CrmContactLookupResponseDto contact;

}
