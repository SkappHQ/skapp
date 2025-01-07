package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.enterprise.common.mapper.EpCommonMapper;
import com.skapp.enterprise.common.model.DeviceToken;
import com.skapp.enterprise.common.payload.request.RegisterDeviceTokenDto;
import com.skapp.enterprise.common.repository.DeviceTokenDao;
import com.skapp.enterprise.common.service.DeviceTokenService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeviceTokenServiceImpl implements DeviceTokenService {

	@NonNull
	private final DeviceTokenDao deviceTokenDao;

	@NonNull
	private final UserService userService;

	@NonNull
	private final EpCommonMapper epCommonMapper;

	@Override
	@Transactional
	public ResponseEntityDto registerDevice(RegisterDeviceTokenDto registerDeviceTokenDto) {
		User user = userService.getCurrentUser();
		Optional<DeviceToken> existingDeviceTokenOpt = deviceTokenDao
			.findByToken(registerDeviceTokenDto.getDeviceToken());
		if (existingDeviceTokenOpt.isPresent()) {
			log.info("registerDevice: Device token {} already exists", registerDeviceTokenDto.getDeviceToken());
			return new ResponseEntityDto(false,
					epCommonMapper.deviceTokenToDeviceTokenResponse(existingDeviceTokenOpt.get()));
		}

		DeviceToken deviceToken = new DeviceToken();
		deviceToken.setToken(registerDeviceTokenDto.getDeviceToken());
		deviceToken.setUserId(user.getUserId());
		DeviceToken response = deviceTokenDao.save(deviceToken);
		return new ResponseEntityDto(false, epCommonMapper.deviceTokenToDeviceTokenResponse(response));
	}

}
