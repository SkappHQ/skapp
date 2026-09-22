package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.peopleplanner.payload.request.EmployeeBasicDetailsResponseDto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeBirthdayResponseDto extends EmployeeBasicDetailsResponseDto {

	private String jobFamily;

	private String jobTitle;

}
