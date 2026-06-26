package com.skapp.community.timeplanner.payload.request;

import com.skapp.community.peopleplanner.payload.request.EmployeeDto;
import com.skapp.community.peopleplanner.type.RequestStatus;
import com.skapp.community.peopleplanner.type.RequestType;
import com.skapp.community.timeplanner.payload.response.TimeRecordParentDto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ManagerTimeRequestResponseDto {

	private Long timeRequestId;

	private Long initialClockIn;

	private Long initialClockOut;

	private Long requestedStartTime;

	private Long requestedEndTime;

	private RequestType requestType;

	private RequestStatus status;

	private double workHours;

	private EmployeeDto employee;

	private TimeRecordParentDto timeRecord;

}
