package com.skapp.community.timeplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.time.Month;
import java.util.List;

@Getter
@Setter
public class AverageHoursWorkedTrendFilterDto {

	private Month month;

	private List<Long> teams;

}
