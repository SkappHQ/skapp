package com.skapp.community.peopleplanner.service;

import com.skapp.community.common.payload.request.BirthdayNotificationConfigRequestDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;

public interface PeopleConfigService {

	ResponseEntityDto getBirthdayNotificationConfigs();

	ResponseEntityDto updateBirthdayNotificationConfigs(BirthdayNotificationConfigRequestDto requestDto);

}
