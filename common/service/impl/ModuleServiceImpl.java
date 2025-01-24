package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.ModuleType;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.model.Module;
import com.skapp.enterprise.common.payload.request.SaveModulesRequestDto;
import com.skapp.enterprise.common.payload.request.UpdateModulesRequestDto;
import com.skapp.enterprise.common.payload.response.SaveModulesResponseDto;
import com.skapp.enterprise.common.repository.ModuleDao;
import com.skapp.enterprise.common.service.ModuleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
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

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final UserService userService;

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

		User currentUser = userService.getCurrentUser();
		List<String> activeModules = getActiveModuleNames();
		SaveModulesResponseDto response = new SaveModulesResponseDto();
		response.setActiveModules(activeModules);

		UserDetails userDetails = userDetailsService.loadUserByUsername(currentUser.getEmail());
		String accessToken = jwtService.generateAccessToken(userDetails, currentUser.getUserId());
		String refreshToken = jwtService.generateRefreshToken(userDetails);

		response.setAccessToken(accessToken);
		response.setRefreshToken(refreshToken);

		log.info("Successfully saved new modules. Active modules: {}", response);
		return new ResponseEntityDto(false, response);
	}

	@Override
	public void saveDefaultModules() {
		Set<Module> defaultModules = Set.of(createModule(ModuleType.PEOPLE), createModule(ModuleType.ATTENDANCE),
				createModule(ModuleType.LEAVE));
		moduleDao.saveAll(defaultModules);
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
		return new ResponseEntityDto(false, activeModules);
	}

	@Override
	public ResponseEntityDto hasSelectedModules() {
		log.info("Checking if any modules are selected");

		List<Module> modules = moduleDao.findAll();
		boolean hasSelectedModules = modules.stream()
			.map(Module::getModuleName)
			.anyMatch(module -> module != ModuleType.PEOPLE && module != ModuleType.COMMON);

		return new ResponseEntityDto(false, hasSelectedModules);
	}

	@Override
	@Transactional
	public ResponseEntityDto updateModules(UpdateModulesRequestDto updateModulesRequestDto) {
		log.info("Received request to update module: {}", updateModulesRequestDto);

		validateUpdateRequest(updateModulesRequestDto);
		ModuleType moduleType;

		moduleType = ModuleType.fromDisplayName(updateModulesRequestDto.getModuleName());

		List<String> activeModules = getActiveModuleNames();
		boolean isModuleActive = activeModules.contains(moduleType.name());

		if (updateModulesRequestDto.getIsToggled() && !isModuleActive) {
			log.info("Enabling module: {}", moduleType.name());
			Module newModule = createModule(moduleType);
			moduleDao.save(newModule);
		}
		else if (!updateModulesRequestDto.getIsToggled() && isModuleActive) {
			log.info("Disabling module: {}", moduleType.name());
			moduleDao.deleteById(moduleType);
		}

		activeModules = getActiveModuleNames();
		log.info("Successfully updated module. Active modules: {}", activeModules);

		return new ResponseEntityDto(false, activeModules);
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

	private void validateUpdateRequest(UpdateModulesRequestDto request) {
		if (request == null || request.getModuleName() == null || request.getModuleName().trim().isEmpty()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SELECTED_MODULES_CANNOT_BE_NULL);
		}

		ModuleType moduleType = Arrays.stream(ModuleType.values())
			.filter(type -> type.getDisplayName().equalsIgnoreCase(request.getModuleName()))
			.findFirst()
			.orElseThrow(() -> new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_MODULE_TYPE));

		boolean isModuleInDb = moduleDao.existsById(moduleType);

		Boolean toggled = request.getIsToggled();
		if (toggled == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_MODULE_STATUS);
		}

		if (toggled && isModuleInDb) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_MODULE_ALREADY_SELECTED);
		}

		if (!toggled && !isModuleInDb) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_MODULE_ALREADY_DESELECTED);
		}
	}

	private Module createModule(ModuleType moduleType) {
		Module module = new Module();
		module.setModuleName(moduleType);
		return module;
	}

}
