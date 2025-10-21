package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.SystemVersionService;
import com.skapp.community.common.type.ModuleType;
import com.skapp.community.common.type.SystemVersionTypes;
import com.skapp.community.common.type.VersionType;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.model.ModuleConfig;
import com.skapp.enterprise.common.payload.request.UpdateModulesRequestDto;
import com.skapp.enterprise.common.repository.ModuleDao;
import com.skapp.enterprise.common.service.ModuleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ModuleServiceImpl implements ModuleService {

	private final ModuleDao moduleDao;

	private final SystemVersionService systemVersionService;

	@Override
	@Transactional
	public void setDefaultModules() {
		log.info("setDefaultModules: Setting default modules configuration");

		ModuleConfig moduleConfig = new ModuleConfig();
		moduleConfig.setId(1L);
		moduleConfig.setLeaveModule(true);
		moduleConfig.setAttendanceModule(true);
		moduleConfig.setEsignModule(true);
		moduleConfig.setInvoiceModule(true);
		moduleConfig.setPmModule(true);

		moduleDao.save(moduleConfig);
		log.info("setDefaultModules: Default modules configuration set successfully");
	}

	@Override
	@Transactional
	public ResponseEntityDto updateModules(UpdateModulesRequestDto updateModulesRequestDto) {
		log.info("Received request to update module: {}", updateModulesRequestDto);

		validateUpdateRequest(updateModulesRequestDto);

		ModuleConfig moduleConfig = moduleDao.findFirstBy()
			.orElseThrow(() -> new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_MODULE_CONFIG_NOT_FOUND));

		updateModuleState(moduleConfig, updateModulesRequestDto.getModuleName(),
				updateModulesRequestDto.getIsToggled());
		moduleDao.save(moduleConfig);

		List<String> activeModules = getActiveModuleNames(moduleConfig);

		systemVersionService.upgradeSystemVersion(VersionType.MINOR, SystemVersionTypes.MODULE_CHANGE);

		log.info("Successfully updated module. Active modules: {}", activeModules);
		return new ResponseEntityDto(false, activeModules);
	}

	@Override
	public ResponseEntityDto getActiveModules() {
		ModuleConfig moduleConfig = moduleDao.findFirstBy()
			.orElseThrow(() -> new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_MODULE_CONFIG_NOT_FOUND));

		return new ResponseEntityDto(false, getActiveModuleNames(moduleConfig));
	}

	private void updateModuleState(ModuleConfig moduleConfig, ModuleType moduleType, boolean isToggled) {
		switch (moduleType) {
			case LEAVE -> moduleConfig.setLeaveModule(isToggled);
			case ATTENDANCE -> moduleConfig.setAttendanceModule(isToggled);
			case ESIGN -> moduleConfig.setEsignModule(isToggled);
			case INVOICE -> moduleConfig.setInvoiceModule(isToggled);
			case PM -> moduleConfig.setPmModule(isToggled);
			default -> throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_MODULE_NAME);
		}
	}

	private List<String> getActiveModuleNames(ModuleConfig moduleConfig) {
		List<String> activeModules = new ArrayList<>();
		if (moduleConfig.isLeaveModule())
			activeModules.add(ModuleType.LEAVE.name());
		if (moduleConfig.isAttendanceModule())
			activeModules.add(ModuleType.ATTENDANCE.name());
		if (moduleConfig.isEsignModule())
			activeModules.add(ModuleType.ESIGN.name());
		if (moduleConfig.isInvoiceModule())
			activeModules.add(ModuleType.INVOICE.name());
		if (moduleConfig.isPmModule())
			activeModules.add(ModuleType.PM.name());
		return activeModules.stream().sorted().toList();
	}

	private void validateUpdateRequest(UpdateModulesRequestDto request) {
		if (request == null || request.getModuleName() == null || request.getIsToggled() == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SELECTED_MODULES_CANNOT_BE_NULL);
		}

		ModuleConfig moduleConfig = moduleDao.findFirstBy()
			.orElseThrow(() -> new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_MODULE_CONFIG_NOT_FOUND));

		boolean currentState = getCurrentModuleState(moduleConfig, request.getModuleName());

		if (Boolean.TRUE.equals(request.getIsToggled()) && currentState) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_MODULE_ALREADY_SELECTED);
		}

		if (Boolean.FALSE.equals(request.getIsToggled()) && !currentState) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_MODULE_ALREADY_DESELECTED);
		}
	}

	@Override
	public boolean getCurrentModuleState(ModuleConfig moduleConfig, ModuleType moduleType) {
		return switch (moduleType) {
			case LEAVE -> moduleConfig.isLeaveModule();
			case ATTENDANCE -> moduleConfig.isAttendanceModule();
			case ESIGN -> moduleConfig.isEsignModule();
			case INVOICE -> moduleConfig.isInvoiceModule();
			case PM -> moduleConfig.isPmModule();
			default -> false;
		};
	}

}
