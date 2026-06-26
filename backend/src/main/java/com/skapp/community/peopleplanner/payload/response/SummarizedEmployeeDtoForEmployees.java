package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.peopleplanner.payload.request.JobTitleDto;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.community.peopleplanner.type.EmploymentAllocation;
import com.skapp.community.peopleplanner.type.Gender;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SummarizedEmployeeDtoForEmployees {

	private String firstName;

	private String lastName;

	private String middleName;

	private String authPic;

	private Gender gender;

	private String email;

	private String timeZone;

	private EmployeeJobFamilyDto jobFamily;

	private JobTitleDto jobTitle;

	private EmploymentAllocation employmentAllocation;

	private List<TeamEmployeeResponseDto> teams;

	private SummarizedEmployeePersonalInfoDto personalInfo;

	private AccountStatus accountStatus;

}
