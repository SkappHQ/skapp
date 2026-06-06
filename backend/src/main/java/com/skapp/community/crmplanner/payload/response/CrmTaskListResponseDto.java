package com.skapp.community.crmplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CrmTaskListResponseDto {

	private List<CrmTaskResponseDto> tasks;

}
