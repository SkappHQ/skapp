package com.skapp.community.crmplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CrmTaskListResponseDto {

	private List<CrmTaskResponseDto> overdue;

	private List<CrmTaskResponseDto> dueToday;

	private List<CrmTaskResponseDto> dueTomorrow;

	private List<CrmTaskResponseDto> upcoming;

}
