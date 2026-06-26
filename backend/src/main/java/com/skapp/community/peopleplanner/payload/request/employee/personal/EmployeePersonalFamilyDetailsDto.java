package com.skapp.community.peopleplanner.payload.request.employee.personal;

import com.skapp.community.peopleplanner.type.Gender;
import com.skapp.community.peopleplanner.type.RelationshipTypes;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EmployeePersonalFamilyDetailsDto {

	private Long familyId;

	private String firstName;

	private String lastName;

	private Gender gender;

	private RelationshipTypes relationship;

	private LocalDate dateOfBirth;

	private String parentName;

}
