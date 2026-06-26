package com.skapp.community.peopleplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ProbationPeriodDto {

	private Long id;

	private LocalDate startDate;

	private LocalDate endDate;

	private Boolean isActive;

}
