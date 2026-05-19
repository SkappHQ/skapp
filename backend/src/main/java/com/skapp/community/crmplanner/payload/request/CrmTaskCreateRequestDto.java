package com.skapp.community.crmplanner.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CrmTaskCreateRequestDto {

	@NotBlank(message = "Task name is required")
	private String name;

	@NotNull(message = "Task type is required")
	private Long typeId;

	@NotNull(message = "Task priority is required")
	private Long priorityId;

	private LocalDateTime dueAt;

	private String notes;

	private Long ownerId;

	private Long dealId;

}
