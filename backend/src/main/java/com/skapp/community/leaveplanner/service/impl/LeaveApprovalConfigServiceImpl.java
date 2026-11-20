package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.model.OrganizationConfig;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.OrganizationConfigDao;
import com.skapp.community.common.type.OrganizationConfigType;
import com.skapp.community.leaveplanner.payload.LeaveApprovalConfigDto;
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

		boolean isEnabled = isMultiLevelApprovalEnabled();

		log.info("getLeaveApprovalConfig: execution ended");
		return new ResponseEntityDto(false, new LeaveApprovalConfigDto(isEnabled));
	}

	@Override
	@Transactional
	public ResponseEntityDto updateLeaveApprovalConfig(LeaveApprovalConfigDto leaveApprovalConfigDto) {
		log.info("updateLeaveApprovalConfig: execution started");

		String jsonValue = jsonMapper.writeValueAsString(leaveApprovalConfigDto);
		OrganizationConfig organizationConfig = organizationConfigDao
			.findOrganizationConfigByOrganizationConfigType(OrganizationConfigType.LEAVE_APPROVAL.name())
			.orElseGet(() -> new OrganizationConfig(OrganizationConfigType.LEAVE_APPROVAL.name(), jsonValue));
		organizationConfig.setOrganizationConfigValue(jsonValue);
		organizationConfigDao.save(organizationConfig);

		log.info("updateLeaveApprovalConfig: execution ended");
		return new ResponseEntityDto(false, leaveApprovalConfigDto);
	}

	@Override
	@Transactional(readOnly = true)
	public boolean isMultiLevelApprovalEnabled() {
		log.info("isMultiLevelApprovalEnabled: execution started");

		boolean isEnabled = organizationConfigDao
			.findOrganizationConfigByOrganizationConfigType(OrganizationConfigType.LEAVE_APPROVAL.name())
			.map(config -> jsonMapper.readValue(config.getOrganizationConfigValue(), LeaveApprovalConfigDto.class))
			.map(config -> Boolean.TRUE.equals(config.getIsMultiLevelApprovalEnabled()))
			.orElse(false);

		log.info("isMultiLevelApprovalEnabled: execution ended");
		return isEnabled;
	}

}
