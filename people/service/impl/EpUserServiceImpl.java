package com.skapp.enterprise.people.service.impl;

import com.skapp.enterprise.common.payload.request.AdditionalDetailsDto;
import com.skapp.enterprise.common.payload.request.AuthenticationDetailsDto;
import com.skapp.enterprise.common.type.TenantStatus;
import com.skapp.enterprise.common.type.Tier;
import com.skapp.enterprise.people.service.EpUserService;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@Primary
public class EpUserServiceImpl implements EpUserService {

	@Override
	public Tier getCurrentUserTier() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		AuthenticationDetailsDto authenticationDetails = (AuthenticationDetailsDto) authentication.getDetails();
		AdditionalDetailsDto additionalDetails = authenticationDetails.getAdditionalDetails();

		if (additionalDetails != null && additionalDetails.getTier() != null) {
			return Tier.valueOf(additionalDetails.getTier());
		}

		return Tier.FREE;
	}

	@Override
	public TenantStatus getCurrentUserTenantStatus() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		AuthenticationDetailsDto authenticationDetails = (AuthenticationDetailsDto) authentication.getDetails();
		AdditionalDetailsDto additionalDetails = authenticationDetails.getAdditionalDetails();

		if (additionalDetails != null && additionalDetails.getTenantStatus() != null) {
			return TenantStatus.valueOf(additionalDetails.getTenantStatus());
		}

		return TenantStatus.ACTIVE;
	}

}
