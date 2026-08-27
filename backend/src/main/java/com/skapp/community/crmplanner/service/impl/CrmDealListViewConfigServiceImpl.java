package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.model.UserSettings;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.UserService;
import com.skapp.community.crmplanner.constant.DefaultCrmDealListViewTemplate;
import com.skapp.community.crmplanner.service.CrmDealListViewConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CrmDealListViewConfigServiceImpl implements CrmDealListViewConfigService {

	private final UserService userService;

	private final UserDao userDao;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getListViewConfig() {
		log.info("getListViewConfig: execution started");

		User user = userService.getCurrentUser();
		UserSettings settings = user.getSettings();
		JsonNode saved = settings != null ? settings.getCrmDealListView() : null;

		JsonNode config = (saved == null || saved.isNull()) ? DefaultCrmDealListViewTemplate.build() : saved;

		log.info("getListViewConfig: execution ended");
		return new ResponseEntityDto(false, config);
	}

	@Override
	@Transactional
	public ResponseEntityDto updateListViewConfig(JsonNode config) {
		log.info("updateListViewConfig: execution started");

		User currentUser = userService.getCurrentUser();
		Optional<User> optionalUser = userDao.findById(currentUser.getUserId());
		if (optionalUser.isEmpty()) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}
		User user = optionalUser.get();

		UserSettings settings = user.getSettings();
		if (settings == null) {
			settings = new UserSettings();
			settings.setUser(user);
			user.setSettings(settings);
		}
		settings.setCrmDealListView(config);
		userDao.save(user);

		log.info("updateListViewConfig: execution ended successfully");
		return new ResponseEntityDto(false, config);
	}

}
