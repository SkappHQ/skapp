package com.skapp.community.leaveplanner.payload;

import com.skapp.community.leaveplanner.type.OrganizationalLeaveAnalyticsKPIType;
import jakarta.annotation.Nullable;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class LeaveAnalyticsFilterDto {

	@Nullable
	private OrganizationalLeaveAnalyticsKPIType analyticsType;

	private List<OrganizationalLeaveAnalyticsKPIDto> organizationalLeaveAnalyticsDto;

}
