package com.skapp.community.peopleplanner.payload.request.employee;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EmployeeJoinedDateRequestDto {

	private LocalDate joinedDate;

}
