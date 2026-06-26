package com.skapp.community.timeplanner.payload.response;

import com.skapp.community.peopleplanner.payload.request.EmployeeBasicDetailsResponseDto;
import com.skapp.community.peopleplanner.type.RequestStatus;
import com.skapp.community.peopleplanner.type.RequestType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeTimeRequestResponseDto {

	private Long timeRequestId;

	private RequestType requestType;

	private Long requestedStartTime;

	private Long requestedEndTime;

	private Long initialClockIn;

	private Long initialClockOut;

	private Double workHours;

	private RequestStatus status;

	private TimeRecordParentDto timeRecord;

	private EmployeeBasicDetailsResponseDto employee;

}
