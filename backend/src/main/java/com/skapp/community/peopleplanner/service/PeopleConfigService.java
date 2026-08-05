package com.skapp.community.peopleplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.payload.request.BirthdayNotificationConfigRequestDto;

public interface PeopleConfigService {

	ResponseEntityDto getBirthdayNotificationConfigs();

	ResponseEntityDto updateBirthdayNotificationConfigs(BirthdayNotificationConfigRequestDto requestDto);

}
