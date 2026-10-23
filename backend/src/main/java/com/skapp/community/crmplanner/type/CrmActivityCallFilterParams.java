package com.skapp.community.crmplanner.type;

import com.skapp.community.common.type.Role;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

import java.time.Instant;

@Getter
@Setter
public class CrmActivityCallFilterParams {

	private Long currentEmployeeId;

	private Role crmRole;

	private Boolean isSuperAdmin;

	private Long ownerId;

	private String searchKeyword;

	private Instant loggedFrom;

	private Instant loggedBefore;

	private CrmActivityCallSort sortKey;

	private Sort.Direction sortOrder;

}
