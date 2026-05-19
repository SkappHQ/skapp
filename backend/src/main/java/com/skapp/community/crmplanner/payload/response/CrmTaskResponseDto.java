package com.skapp.community.crmplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CrmTaskResponseDto {

	private Long id;

	private String name;

	private Boolean isCompleted;

	private LocalDateTime dueAt;

	private String notes;

	private CrmTaskTypeResponseDto type;

	private CrmPriorityResponseDto priority;

	private CrmContactOwnerResponseDto owner;

}
