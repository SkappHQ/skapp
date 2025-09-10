package com.skapp.enterprise.common.service;

import com.skapp.enterprise.common.payload.response.EpVersionResponseDto;

public interface EpVersionService {

	EpVersionResponseDto getVersionsByUserId(Long employeeId);

}
