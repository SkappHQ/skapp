package com.skapp.enterprise.common.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;

public interface EpRedisService {

	ResponseEntityDto loadAllUserDataToRedis();

	ResponseEntityDto loadSystemVersionToRedis();

	ResponseEntityDto loadAllUserVersionsToRedis();

}
