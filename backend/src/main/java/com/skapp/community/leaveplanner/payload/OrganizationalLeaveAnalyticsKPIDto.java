package com.skapp.community.leaveplanner.payload;

import com.skapp.community.leaveplanner.type.OrganizationalLeaveAnalyticsKPIAbsenceType;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OrganizationalLeaveAnalyticsKPIDto {

	private OrganizationalLeaveAnalyticsKPIAbsenceType type;

	private Float absenceRate;

	private String dateRange;

}
