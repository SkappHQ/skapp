package com.skapp.enterprise.people.service;

import com.skapp.community.common.model.User;
import com.skapp.enterprise.common.payload.request.EpGuestUserRequestDto;
import com.skapp.enterprise.common.payload.response.EpUserResponseDto;

import java.util.List;

public interface EpGuestUserService {

	EpUserResponseDto saveGuestUsers(EpGuestUserRequestDto epGuestUserRequestDto);

	User validateGuestUserEmail(String email);

	List<EpUserResponseDto> getAllGuestUsers();

}
