package com.skapp.community.crmplanner.type;

import com.skapp.community.common.type.Role;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

import java.time.Instant;

@Getter
@Setter
public class CrmActivityListParams {

	private Long currentEmployeeId;

	private Role crmRole;

	private Boolean isSuperAdmin;

	private Long ownerId;

	private String searchPattern;

	private Instant rangeStart;

	private Instant rangeEnd;

	private Sort.Direction sortOrder;

}
