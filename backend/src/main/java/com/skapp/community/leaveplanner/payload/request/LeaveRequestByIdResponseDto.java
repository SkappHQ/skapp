package com.skapp.community.leaveplanner.payload.request;

import com.skapp.community.leaveplanner.payload.response.LeaveRequestResponseDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeBasicDetailsResponseDto;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
public class LeaveRequestByIdResponseDto extends LeaveRequestResponseDto {

	private String requestDesc;

	private String reviewerComment;

	private Instant reviewedDate;

	private EmployeeBasicDetailsResponseDto employee;

	private EmployeeBasicDetailsResponseDto reviewer;

	private Boolean isViewed;

	private Instant createdDate;

	private List<LeaveRequestAttachmentDto> attachments;

}
