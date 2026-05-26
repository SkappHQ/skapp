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
import com.skapp.enterprise.pm.payload.EpGuestUserRequestInternalResponseDto;
import com.skapp.enterprise.pm.payload.EpGuestUserRequestResponseDto;
import com.skapp.enterprise.pm.payload.EpGuestUserResponseDto;
import com.skapp.enterprise.pm.payload.GuestInvitationValidationResponseDto;

import java.util.List;

public interface EpGuestUserService {

	ResponseEntityDto createGuestUser(EpGuestUserInviteRequestDto epGuestUserInviteRequestDto);

	ResponseEntityDto createGuestUsers(EpGuestUserBulkInviteRequestDto epGuestUserBulkInviteRequestDto);

	ResponseEntityDto createGuestUsersInternal(EpGuestUserBulkInviteRequestDto epGuestUserBulkInviteRequestDto);

	User validateGuestUserEmail(String email);

	List<EpGuestUserResponseDto> getAllGuestUsers(String email, List<AccountStatus> statuses, List<Long> projectIds);

	List<EpGuestUserRequestResponseDto> getPendingGuestUserRequests(String email);

	List<EpGuestUserRequestInternalResponseDto> getPendingGuestUserRequestsInternal(String email,
			List<Long> projectIds);

	EpUserResponseDto reInviteGuestUsers(EpGuestUserReInviteRequestDto epGuestUserReInviteRequestDto);

	ResponseEntityDto deleteGuestUser(Long id);

	ResponseEntityDto deactivateGuestUser(Long id);

	ResponseEntityDto activateGuestUser(Long id);

	ResponseEntityDto updateGuestUserApprovalStatus(EpGuestUserApprovalRequestDto epGuestUserApprovalRequestDto);

	EpUserResponseDto updateGuestUser(EpGuestUserUpdateRequestDto epGuestUserUpdateRequestDto);

	ResponseEntityDto getPendingGuestUsersCount();

	ResponseEntityDto revokeGuestUserRequest(Long requestId);

	List<GuestInvitationValidationResponseDto> validateGuestInvitations(List<String> emails);

}
