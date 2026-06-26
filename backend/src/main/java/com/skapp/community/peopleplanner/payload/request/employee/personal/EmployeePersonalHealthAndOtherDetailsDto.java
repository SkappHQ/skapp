package com.skapp.community.peopleplanner.payload.request.employee.personal;

import com.skapp.community.peopleplanner.type.BloodGroup;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeePersonalHealthAndOtherDetailsDto {

	private BloodGroup bloodGroup;

	private String allergies;

	private String dietaryRestrictions;

	private String tShirtSize;

}
