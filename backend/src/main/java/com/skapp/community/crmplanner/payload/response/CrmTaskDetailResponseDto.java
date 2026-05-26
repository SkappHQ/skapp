package com.skapp.community.crmplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CrmTaskDetailResponseDto {

	private Long id;

	private String name;

	private String type;

	private String priority;

	private LocalDateTime dueAt;

	private Boolean isOverdue;

	private Boolean isCompleted;

	private CrmContactOwnerResponseDto owner;

}
