package com.skapp.enterprise.people.service;

import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.EpGuestUserInviteRequestDto;
import com.skapp.enterprise.common.payload.request.EpGuestUserReInviteRequestDto;
import com.skapp.enterprise.common.payload.response.EpUserResponseDto;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface EpGuestUserService {

	EpUserResponseDto saveAndInviteGuestUsers(EpGuestUserInviteRequestDto epGuestUserInviteRequestDto);

	User validateGuestUserEmail(String email);

	List<EpUserResponseDto> getAllGuestUsers();

	EpUserResponseDto reInviteGuestUsers(EpGuestUserReInviteRequestDto epGuestUserReInviteRequestDto);

	@Transactional
	ResponseEntityDto deleteGuestUser(String email);

	@Transactional
	ResponseEntityDto deactivateGuestUser(String email);

	@Transactional
	ResponseEntityDto activateGuestUser(String email);

}
