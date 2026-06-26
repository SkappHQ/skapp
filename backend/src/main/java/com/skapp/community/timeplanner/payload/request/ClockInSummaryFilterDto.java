package com.skapp.community.timeplanner.payload.request;

import com.skapp.community.timeplanner.type.ClockInType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class ClockInSummaryFilterDto {

	private List<Long> teams;

	private List<ClockInType> clockInType;

	private LocalDate date;

	private String searchKeyword;

}
