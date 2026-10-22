package com.skapp.community.crmplanner.activity.payload.request;

import com.skapp.community.crmplanner.activity.type.CrmActivityFeedTab;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Getter
@Setter
public class CrmActivityFeedFilterDto {

	private CrmActivityFeedTab type = CrmActivityFeedTab.ALL;

	private String search;

	private Long ownerId;

	@DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
	private LocalDate from;

	@DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
	private LocalDate to;

	private int page = 0;

}
