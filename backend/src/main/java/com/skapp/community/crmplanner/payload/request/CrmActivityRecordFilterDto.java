package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmActivityRecordType;
import com.skapp.community.crmplanner.type.CrmActivityType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmActivityRecordFilterDto {

	private CrmActivityRecordType recordType;

	private Long recordId;

	private CrmActivityType type;

	private String search;

	private Integer page = 0;

	private Integer size = 25;

}
