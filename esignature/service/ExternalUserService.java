package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.model.ExternalUser;
import com.skapp.enterprise.esignature.payload.request.ExternalUserDto;

public interface ExternalUserService {

	/**
	 * Creates a new ExternalUser.
	 * @param externalUser The external user to be created.
	 * @return The created ExternalUser.
	 */
	ExternalUser createExternalUser(ExternalUserDto externalUser);

	ResponseEntityDto editExternalUserinAddressBook(Long id, ExternalUserDto externalUserDto);

	ResponseEntityDto deleteExternalUser(Long id);

}
