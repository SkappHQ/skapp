package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.leaveplanner.type.OrganizationalLeaveAnalyticsKPIAbsenceType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PolicyAbsenceRateResponseDto {

	private OrganizationalLeaveAnalyticsKPIAbsenceType type;

	private Float currentAbsenceRate;

	private Float monthBeforeAbsenceRate;

}
