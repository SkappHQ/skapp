package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.type.ModuleType;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.model.Module;
import com.skapp.enterprise.common.payload.request.SaveModulesRequestDto;
import com.skapp.enterprise.common.repository.ModuleDao;
import com.skapp.enterprise.common.service.ModuleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ModuleServiceImpl implements ModuleService {

	private final ModuleDao moduleDao;

	@Override
	@Transactional
	public ResponseEntityDto saveModules(SaveModulesRequestDto saveModulesRequestDto) {
		log.info("Received request to save new modules: {}", saveModulesRequestDto);

		validateRequest(saveModulesRequestDto);
		List<Module> existingModules = moduleDao.findAll();

		if (!existingModules.isEmpty()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_MODULES_ALREADY_EXIST);
		}

		Set<ModuleType> modulesToSave = new HashSet<>(saveModulesRequestDto.getSelectedModules());
		modulesToSave.add(ModuleType.PEOPLE);

		Set<Module> newModules = modulesToSave.stream().map(this::createModule).collect(Collectors.toSet());

		moduleDao.saveAll(newModules);

		List<String> activeModules = getActiveModuleNames();
		log.info("Successfully saved new modules. Active modules: {}", activeModules);
		return new ResponseEntityDto(false, activeModules);
	}

	@Override
	public ResponseEntityDto getActiveModules() {
		log.info("Fetching active modules");

		List<String> activeModules = moduleDao.findAll()
			.stream()
			.map(module -> module.getModuleName().name())
			.sorted()
			.toList();

		log.info("Found active modules: {}", activeModules);
		return new ResponseEntityDto(true, activeModules);
	}

	@Override
	public ResponseEntityDto hasSelectedModules() {
		log.info("Checking if any modules are selected");

		List<Module> modules = moduleDao.findAll();
		boolean hasSelectedModules = modules.stream()
			.map(Module::getModuleName)
			.anyMatch(module -> module != ModuleType.PEOPLE && module != ModuleType.COMMON);

		return new ResponseEntityDto(true, hasSelectedModules);
	}

	private List<String> getActiveModuleNames() {
		return moduleDao.findAll().stream().map(module -> module.getModuleName().name()).sorted().toList();
	}

	private void validateRequest(SaveModulesRequestDto request) {
		if (request == null || request.getSelectedModules() == null || request.getSelectedModules().isEmpty()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SELECTED_MODULES_CANNOT_BE_NULL);
		}

		request.setSelectedModules(request.getSelectedModules()
			.stream()
			.filter(module -> module != ModuleType.COMMON && module != ModuleType.PEOPLE)
			.collect(Collectors.toSet()));

		boolean hasInvalidModules = !new HashSet<>(Arrays.asList(ModuleType.values()))
			.containsAll(request.getSelectedModules());

		if (hasInvalidModules) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_MODULE_TYPE);
		}
	}

	private Module createModule(ModuleType moduleType) {
		Module module = new Module();
		module.setModuleName(moduleType);
		return module;
	}

}
