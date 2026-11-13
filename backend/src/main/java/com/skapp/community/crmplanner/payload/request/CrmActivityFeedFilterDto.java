package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmActivityRecordType;
import com.skapp.community.crmplanner.type.CrmActivityType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CrmActivityFeedFilterDto {

	private String search;

	private Long ownerId;

	private LocalDate fromDate;

	private LocalDate toDate;

	private CrmActivityRecordType recordType;

	private Long recordId;

	private CrmActivityType type;

	private int page = 0;

	private int size = 25;

}
