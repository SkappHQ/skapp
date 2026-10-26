package com.skapp.community.crmplanner.payload.response;

import com.skapp.community.crmplanner.type.CrmActivityTaskPriority;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CrmActivityTaskResponseDto {

	private Long id;

	private String name;

	private Instant dueAt;

	private CrmActivityTaskPriority priority;

	private Boolean isCompleted;

	private Instant completedAt;

	private Long ownerId;

	private Long contactId;

	private Long dealId;

	private Long companyId;

}
