package com.skapp.enterprise.common.payload.response;

import com.skapp.enterprise.common.type.Tier;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TenantAvailabilityResponseDto {

	private Boolean isTenantAvailable;

	private String subDomainName;

	private Tier tier;

}
