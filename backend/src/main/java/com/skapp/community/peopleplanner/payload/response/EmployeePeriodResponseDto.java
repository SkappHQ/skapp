package com.skapp.community.peopleplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class EmployeePeriodResponseDto {

	private Long id;

	private Date startDate;

	private Date endDate;

	private Boolean isActive;

}
