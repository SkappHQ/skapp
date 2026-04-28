package com.skapp.enterprise.timeplanner.service;

import com.skapp.community.timeplanner.payload.response.TimeConfigResponseDto;

import java.util.List;

public interface EpTimeInternalService {

	List<TimeConfigResponseDto> getOrganizationTimeConfigs();

}
