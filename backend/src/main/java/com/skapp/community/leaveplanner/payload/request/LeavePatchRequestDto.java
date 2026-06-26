package com.skapp.community.leaveplanner.payload.request;

import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class LeavePatchRequestDto {

	private LocalDate startDate;

	private LocalDate endDate;

	private Boolean isViewed;

	private String requestDesc;

	private LeaveRequestStatus leaveRequestStatus;

}
