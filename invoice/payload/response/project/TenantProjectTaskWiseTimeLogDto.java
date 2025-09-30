package com.skapp.enterprise.invoice.payload.response.project;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TenantProjectTaskWiseTimeLogDto {

	private Double billableTime;

	private Boolean isDeleted;

	private List<TaskWorkLogDto> itemInfoWorkLog;

	private Long id;

	private String title;

	private Double totalTime;

}
