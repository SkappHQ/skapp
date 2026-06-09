package com.skapp.community.crmplanner.payload.response;

import com.skapp.community.crmplanner.type.CrmTaskPriority;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CrmTaskDetailResponseDto {

	private Long id;

	private String name;

	private String type;

	private CrmTaskPriority priority;

	private LocalDateTime dueAt;

	private Boolean isOverdue;

	private Boolean isCompleted;

	private CrmOwnerResponseDto owner;

}
