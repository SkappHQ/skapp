package com.skapp.enterprise.people.service;

import com.skapp.community.common.model.User;
import com.skapp.enterprise.common.payload.request.EpGuestUserRequestDto;
import com.skapp.enterprise.common.payload.response.EpUserResponseDto;

public interface EpGuestUserService {

	EpUserResponseDto saveGuestUsers(EpGuestUserRequestDto epGuestUserRequestDto);

	User validateGuestUserEmail(String email);

}
