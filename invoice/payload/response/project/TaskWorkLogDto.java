package com.skapp.enterprise.invoice.payload.response.project;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TaskWorkLogDto {

	private String workType;

	private Long userId;

	private Double time;

}
