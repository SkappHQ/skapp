package com.skapp.enterprise.common.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TenantAvailabilityResponseDto {

	private Boolean isTenantAvailable;

	private String subDomainName;

}
