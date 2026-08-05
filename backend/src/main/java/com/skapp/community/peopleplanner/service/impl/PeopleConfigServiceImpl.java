package com.skapp.community.peopleplanner.service.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.SpecialNotificationService;
import com.skapp.community.common.type.SpecialNotificationType;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.payload.request.BirthdayNotificationConfigRequestDto;
import com.skapp.community.peopleplanner.payload.response.BirthdayNotificationConfigDto;
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

	private final MessageUtil messageUtil;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getBirthdayNotificationConfigs() {
		log.info("getBirthdayNotificationConfigs: execution started");

		BirthdayNotificationConfigDto responseDto = specialNotificationService
			.getConfig(SpecialNotificationType.BIRTHDAY, BirthdayNotificationConfigDto.class);

		log.info("getBirthdayNotificationConfigs: execution ended");
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	@Transactional
	public ResponseEntityDto updateBirthdayNotificationConfigs(BirthdayNotificationConfigRequestDto requestDto) {
		log.info("updateBirthdayNotificationConfigs: execution started");

		BirthdayNotificationConfigDto config = specialNotificationService.getConfig(SpecialNotificationType.BIRTHDAY,
				BirthdayNotificationConfigDto.class);

		if (requestDto.getIsTurnedOn() != null) {
			config.setIsTurnedOn(requestDto.getIsTurnedOn());
		}
		if (requestDto.getIsOrganizationWide() != null) {
			config.setIsOrganizationWide(requestDto.getIsOrganizationWide());
		}
		if (requestDto.getIsTeamWide() != null) {
			config.setIsTeamWide(requestDto.getIsTeamWide());
		}

		specialNotificationService.saveConfig(SpecialNotificationType.BIRTHDAY, config);

		log.info("updateBirthdayNotificationConfigs: execution ended");
		return new ResponseEntityDto(
				messageUtil.getMessage(PeopleMessageConstant.PEOPLE_SUCCESS_BIRTHDAY_NOTIFICATION_CONFIG_UPDATED),
				false);
	}

}
