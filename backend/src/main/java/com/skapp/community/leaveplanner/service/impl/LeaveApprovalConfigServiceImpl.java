package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.OrganizationConfig;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.OrganizationConfigDao;
import com.skapp.community.common.type.OrganizationConfigType;
import com.skapp.community.leaveplanner.payload.LeaveApprovalConfigDto;
import com.skapp.community.leaveplanner.payload.request.LeaveApprovalConfigRequestDto;
import com.skapp.community.leaveplanner.payload.response.LeaveApprovalConfigResponseDto;
import com.skapp.community.leaveplanner.service.LeaveApprovalConfigService;
import com.skapp.community.leaveplanner.type.ManagerType;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.repository.EmployeeManagerDao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeaveApprovalConfigServiceImpl implements LeaveApprovalConfigService {

	private final OrganizationConfigDao organizationConfigDao;

	private final JsonMapper jsonMapper;

	private final EmployeeManagerDao employeeManagerDao;

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

		if (Boolean.TRUE.equals(leaveApprovalConfigRequestDto.getIsMultiLevelApprovalEnabled())
				&& !isMultiLevelApprovalEnabled()) {
			removeOtherSupervisors();
		}

		LeaveApprovalConfigResponseDto response = buildLeaveApprovalConfigResponse(
				leaveApprovalConfigRequestDto.getIsMultiLevelApprovalEnabled());
		saveLeaveApprovalConfig(
				buildLeaveApprovalConfigValue(leaveApprovalConfigRequestDto.getIsMultiLevelApprovalEnabled()));

		log.info("updateLeaveApprovalConfig: execution ended");
		return new ResponseEntityDto(false, response);
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

	protected void addOtherSupervisorsRemovedTimelineRecords(List<EmployeeManager> removedSupervisors) {
		// Overridden in enterprise to record the removed other supervisors on each
		// employee's timeline
	}

	private void removeOtherSupervisors() {
		List<EmployeeManager> otherSupervisors = employeeManagerDao.findByManagerType(ManagerType.SECONDARY);
		addOtherSupervisorsRemovedTimelineRecords(otherSupervisors);
		employeeManagerDao.deleteAll(otherSupervisors);
	}

	private LeaveApprovalConfigResponseDto buildLeaveApprovalConfigResponse(Boolean isMultiLevelApprovalEnabled) {
		LeaveApprovalConfigResponseDto response = new LeaveApprovalConfigResponseDto();
		response.setIsMultiLevelApprovalEnabled(isMultiLevelApprovalEnabled);
		return response;
	}

	private String buildLeaveApprovalConfigValue(Boolean isMultiLevelApprovalEnabled) {
		LeaveApprovalConfigDto config = new LeaveApprovalConfigDto();
		config.setIsMultiLevelApprovalEnabled(isMultiLevelApprovalEnabled);
		return jsonMapper.writeValueAsString(config);
	}

	private void saveLeaveApprovalConfig(String configValue) {
		OrganizationConfig organizationConfig = organizationConfigDao
			.findOrganizationConfigByOrganizationConfigType(OrganizationConfigType.LEAVE_APPROVAL.name())
			.orElseGet(() -> new OrganizationConfig(OrganizationConfigType.LEAVE_APPROVAL.name(), configValue));
		organizationConfig.setOrganizationConfigValue(configValue);
		organizationConfigDao.save(organizationConfig);
	}

}
