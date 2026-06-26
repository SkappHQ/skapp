package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.peopleplanner.payload.request.JobTitleDto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeJobFamilyResponseDto {

	private Long employeeId;

	private String firstName;

	private String lastName;

	private String authPic;

	private JobTitleDto jobTitle;

}
