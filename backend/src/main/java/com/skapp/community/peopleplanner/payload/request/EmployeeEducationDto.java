package com.skapp.community.peopleplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EmployeeEducationDto {

	private Long educationId;

	private String institution;

	private String degree;

	private String specialization;

	private LocalDate startDate;

	private LocalDate endDate;

}
