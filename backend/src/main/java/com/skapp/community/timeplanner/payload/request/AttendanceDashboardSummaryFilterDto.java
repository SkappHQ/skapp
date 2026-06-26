package com.skapp.community.timeplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AttendanceDashboardSummaryFilterDto {

	private List<Long> teams;

}
