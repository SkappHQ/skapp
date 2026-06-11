package com.skapp.community.crmplanner.payload.response;

import com.skapp.community.crmplanner.type.CrmTaskPriority;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CrmTaskResponseDto {

	private Long id;

	private String name;

	private Long typeId;

	private String typeName;

	private CrmTaskPriority priority;

	private Boolean isCompleted;

	private LocalDateTime dueAt;

	private String notes;

	private Long contactId;

	private String ownerName;

	private CrmOwnerResponseDto owner;

	private CrmContactLookupResponseDto contact;

	private CrmDealLookupResponseDto deal;

}
