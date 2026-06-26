package com.skapp.community.leaveplanner.payload;

import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LeaveRequestManagerUpdateDto {

	private LeaveRequestStatus status;

	private String reviewerComment;

}
