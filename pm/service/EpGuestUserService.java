package com.skapp.enterprise.pm.service;

import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.enterprise.common.payload.request.EpGuestUserApprovalRequestDto;
import com.skapp.enterprise.common.payload.request.EpGuestUserBulkInviteRequestDto;
import com.skapp.enterprise.common.payload.request.EpGuestUserInviteRequestDto;
import com.skapp.enterprise.common.payload.request.EpGuestUserReInviteRequestDto;
import com.skapp.enterprise.common.payload.request.EpGuestUserUpdateRequestDto;
import com.skapp.enterprise.common.payload.response.EpUserResponseDto;
import com.skapp.enterprise.pm.payload.EpGuestUserRequestResponseDto;
import com.skapp.enterprise.pm.payload.EpGuestUserResponseDto;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface EpGuestUserService {

	ResponseEntity<ResponseEntityDto> createGuestUser(EpGuestUserInviteRequestDto epGuestUserInviteRequestDto);

	ResponseEntity<ResponseEntityDto> createGuestUsers(EpGuestUserBulkInviteRequestDto epGuestUserBulkInviteRequestDto);

	List<EpUserResponseDto> createGuestUsersInternal(EpGuestUserBulkInviteRequestDto epGuestUserBulkInviteRequestDto);

	User validateGuestUserEmail(String email);

	List<EpGuestUserResponseDto> getAllGuestUsers(String email, List<AccountStatus> statuses, List<Long> projectIds);

	List<EpGuestUserRequestResponseDto> getPendingGuestUserRequests(String email, List<Long> projectIds);

	EpUserResponseDto reInviteGuestUsers(EpGuestUserReInviteRequestDto epGuestUserReInviteRequestDto);

	@Transactional
	ResponseEntityDto deleteGuestUser(Long id);

	@Transactional
	ResponseEntityDto deactivateGuestUser(Long id);

	@Transactional
	ResponseEntityDto activateGuestUser(Long id);

	ResponseEntityDto updateGuestUserApprovalStatus(EpGuestUserApprovalRequestDto epGuestUserApprovalRequestDto);

	EpUserResponseDto updateGuestUser(EpGuestUserUpdateRequestDto epGuestUserUpdateRequestDto);

	ResponseEntityDto getPendingGuestUsersCount();

}
