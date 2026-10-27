package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
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
			.orElseThrow(() -> new EntityNotFoundException(CrmMessageConstant.CRM_ERROR_CALL_NOT_FOUND));

		User currentUser = userService.getCurrentUser();
		if (CrmValidations.isOwnerRestrictedForRepresentative(currentUser, call.getOwnerId())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_CALL_VIEW_DENIED);
		}

		log.info("getCallById: execution ended");
		return new ResponseEntityDto(false, call);
	}

}
