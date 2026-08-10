package com.skapp.community.crmplanner.payload.response.v2;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CrmTaskListResponseDtoV2 {

	private List<CrmTaskResponseDtoV2> tasks;

}
