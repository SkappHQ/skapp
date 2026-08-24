package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.model.UserSettings;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.UserService;
import com.skapp.community.crmplanner.constant.DefaultCrmDealListViewConfig;
import com.skapp.community.crmplanner.service.CrmDealListViewConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Slf4j
@Service
@RequiredArgsConstructor
public class CrmDealListViewConfigServiceImpl implements CrmDealListViewConfigService {

	private final UserService userService;

	private final UserDao userDao;

	private final ObjectMapper objectMapper;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getListViewConfig() {
		User user = userService.getCurrentUser();
		UserSettings settings = user.getSettings();
		JsonNode saved = settings != null ? settings.getCrmDealListView() : null;

		JsonNode config = (saved == null || saved.isNull()) ? DefaultCrmDealListViewConfig.build(objectMapper) : saved;
		return new ResponseEntityDto(false, config);
	}

	@Override
	@Transactional
	public ResponseEntityDto updateListViewConfig(JsonNode config) {
		User user = userService.getCurrentUser();
		UserSettings settings = user.getSettings();
		if (settings == null) {
			settings = new UserSettings();
			settings.setUser(user);
			user.setSettings(settings);
		}
		settings.setCrmDealListView(config);
		userDao.save(user);

		return new ResponseEntityDto(false, config);
	}

}
