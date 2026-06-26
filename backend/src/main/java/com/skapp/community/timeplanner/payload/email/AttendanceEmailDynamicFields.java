package com.skapp.community.timeplanner.payload.email;

import com.skapp.community.common.payload.email.CommonEmailDynamicFields;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AttendanceEmailDynamicFields extends CommonEmailDynamicFields {

	private String timeEntryDate;

	private String startTime;

	private String endTime;

	private String nonWorkingDates;

}
