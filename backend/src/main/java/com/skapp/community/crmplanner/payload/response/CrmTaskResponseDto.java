package com.skapp.community.crmplanner.payload.response;

import com.skapp.community.crmplanner.type.CrmTaskPriority;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmTaskResponseDto {

	private Long id;

	private String name;

	private Long typeId;

	private String typeName;

	private CrmTaskPriority priority;

	private Long contactId;

	private String ownerName;

}
