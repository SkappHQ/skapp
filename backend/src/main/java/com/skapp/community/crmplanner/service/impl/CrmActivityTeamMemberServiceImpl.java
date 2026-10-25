package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.crmplanner.payload.response.CrmActivityTeamMemberResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityFeedDao;
import com.skapp.community.crmplanner.service.CrmActivityScopeResolver;
import com.skapp.community.crmplanner.service.CrmActivityTeamMemberService;
import com.skapp.community.crmplanner.type.CrmActivityScope;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmActivityTeamMemberServiceImpl implements CrmActivityTeamMemberService {

	private final UserService userService;

	private final CrmActivityScopeResolver crmActivityScopeResolver;

	private final CrmActivityFeedDao crmActivityFeedDao;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getTeamMembers() {
		log.info("getTeamMembers: execution started");

		CrmActivityScope scope = crmActivityScopeResolver.resolveScope(userService.getCurrentUser());
		List<CrmActivityTeamMemberResponseDto> members = crmActivityFeedDao
			.findCrmMembers(scope.orgWide() ? null : scope.ownerIds());

		log.info("getTeamMembers: execution ended");
		return new ResponseEntityDto(false, members);
	}

}
