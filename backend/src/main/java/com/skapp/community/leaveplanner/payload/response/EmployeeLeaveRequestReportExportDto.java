package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeLeaveRequestReportExportDto {

	private Long employeeId;

	private String employeeName;

	private String teams;

	private String leaveType;

	private LeaveRequestStatus status;

	private Float durationDays;

	private String leavePeriod;

	private String dateRequested;

	private Float days;

	private String reason;

}
