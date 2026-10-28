package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.payload.response.CrmActivityCallDetailResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityCallDao;
import com.skapp.community.crmplanner.service.CrmActivityCallDetailService;
import com.skapp.community.crmplanner.util.CrmValidations;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmActivityCallDetailServiceImpl implements CrmActivityCallDetailService {

	private final CrmActivityCallDao crmActivityCallDao;

	private final UserService userService;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getCallById(Long id) {
		log.info("getCallById: execution started");

		CrmActivityCallDetailResponseDto call = crmActivityCallDao.findCallDetailById(id)
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_ACTIVITY_CALL_NOT_FOUND));

		User currentUser = userService.getCurrentUser();
		if (CrmValidations.isOwnerRestrictedForRepresentative(currentUser, call.getOwnerId())) {
			throw new AccessDeniedException(CommonMessageConstant.COMMON_ERROR_ACCESS_DENIED.name());
		}

		if (call.getDealId() != null
				&& CrmValidations.isOwnerRestrictedForRepresentative(currentUser, call.getDealOwnerId())) {
			call.setDealName(null);
			call.setDealAmount(null);
			call.setDealStageId(null);
		}

		log.info("getCallById: execution ended");
		return new ResponseEntityDto(false, call);
	}

}
