package com.skapp.community.peopleplanner.service.impl;

import com.skapp.community.common.payload.SpecialNotificationConfig;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.SpecialNotificationService;
import com.skapp.community.common.type.SpecialNotificationType;
import com.skapp.community.peopleplanner.payload.request.BirthdayNotificationConfigRequestDto;
import com.skapp.community.peopleplanner.service.PeopleConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class PeopleConfigServiceImpl implements PeopleConfigService {

	private final SpecialNotificationService specialNotificationService;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getBirthdayNotificationConfigs() {
		log.info("getBirthdayNotificationConfigs: execution started");

		SpecialNotificationConfig responseDto = specialNotificationService
			.getSpecialNotificationConfig(SpecialNotificationType.BIRTHDAY);

		log.info("getBirthdayNotificationConfigs: execution ended");
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	@Transactional
	public ResponseEntityDto updateBirthdayNotificationConfigs(BirthdayNotificationConfigRequestDto requestDto) {
		log.info("updateBirthdayNotificationConfigs: execution started");

		SpecialNotificationConfig config = specialNotificationService
			.getSpecialNotificationConfig(SpecialNotificationType.BIRTHDAY);

		if (requestDto.getIsTurnedOn() != null) {
			config.setIsTurnedOn(requestDto.getIsTurnedOn());
		}
		if (requestDto.getIsOrganizationWide() != null) {
			config.setIsOrganizationWide(requestDto.getIsOrganizationWide());
		}
		if (requestDto.getIsTeamWide() != null) {
			config.setIsTeamWide(requestDto.getIsTeamWide());
		}

		specialNotificationService.saveSpecialNotificationConfig(SpecialNotificationType.BIRTHDAY, config);

		log.info("updateBirthdayNotificationConfigs: execution ended");
		return new ResponseEntityDto(false, config);
	}

}
