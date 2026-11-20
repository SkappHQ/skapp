package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.OrganizationConfig;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.OrganizationConfigDao;
import com.skapp.community.common.type.OrganizationConfigType;
import com.skapp.community.leaveplanner.payload.request.LeaveApprovalConfigRequestDto;
import com.skapp.community.leaveplanner.payload.response.LeaveApprovalConfigResponseDto;
import com.skapp.community.leaveplanner.service.LeaveApprovalConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeaveApprovalConfigServiceImpl implements LeaveApprovalConfigService {

	private final OrganizationConfigDao organizationConfigDao;

	private final JsonMapper jsonMapper;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getLeaveApprovalConfig() {
		log.info("getLeaveApprovalConfig: execution started");

		LeaveApprovalConfigResponseDto response = buildLeaveApprovalConfigResponse(isMultiLevelApprovalEnabled());

		log.info("getLeaveApprovalConfig: execution ended");
		return new ResponseEntityDto(false, response);
	}

	@Override
	@Transactional
	public ResponseEntityDto updateLeaveApprovalConfig(LeaveApprovalConfigRequestDto leaveApprovalConfigRequestDto) {
		log.info("updateLeaveApprovalConfig: execution started");

		if (leaveApprovalConfigRequestDto.getIsMultiLevelApprovalEnabled() == null) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_VALIDATION_ERROR);
		}

		LeaveApprovalConfigResponseDto response = buildLeaveApprovalConfigResponse(
				leaveApprovalConfigRequestDto.getIsMultiLevelApprovalEnabled());
		saveLeaveApprovalConfig(jsonMapper.writeValueAsString(response));

		log.info("updateLeaveApprovalConfig: execution ended");
		return new ResponseEntityDto(false, response);
	}

	@Override
	@Transactional(readOnly = true)
	public boolean isMultiLevelApprovalEnabled() {
		log.info("isMultiLevelApprovalEnabled: execution started");

		boolean isEnabled = organizationConfigDao
			.findOrganizationConfigByOrganizationConfigType(OrganizationConfigType.LEAVE_APPROVAL.name())
			.map(config -> jsonMapper.readValue(config.getOrganizationConfigValue(),
					LeaveApprovalConfigResponseDto.class))
			.map(config -> Boolean.TRUE.equals(config.getIsMultiLevelApprovalEnabled()))
			.orElse(false);

		log.info("isMultiLevelApprovalEnabled: execution ended");
		return isEnabled;
	}

	private LeaveApprovalConfigResponseDto buildLeaveApprovalConfigResponse(Boolean isMultiLevelApprovalEnabled) {
		LeaveApprovalConfigResponseDto response = new LeaveApprovalConfigResponseDto();
		response.setIsMultiLevelApprovalEnabled(isMultiLevelApprovalEnabled);
		return response;
	}

	private void saveLeaveApprovalConfig(String configValue) {
		OrganizationConfig organizationConfig = organizationConfigDao
			.findOrganizationConfigByOrganizationConfigType(OrganizationConfigType.LEAVE_APPROVAL.name())
			.orElseGet(() -> new OrganizationConfig(OrganizationConfigType.LEAVE_APPROVAL.name(), configValue));
		organizationConfig.setOrganizationConfigValue(configValue);
		organizationConfigDao.save(organizationConfig);
	}

}
