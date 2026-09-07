package com.skapp.community.crmplanner.payload.response.v2;

import com.skapp.community.crmplanner.type.CrmTaskPriority;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CrmTaskResponseDtoV2 {

	private Long id;

	private String name;

	private Long typeId;

	private CrmTaskPriority priority;

	private Boolean isCompleted;

	private Instant dueAt;

	private Instant lastModifiedDate;

	private String notes;

	private Long ownerId;

	private Long contactId;

	private Long companyId;

	private Long dealId;

}
