package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.service.SystemVersionService;
import com.skapp.community.common.service.UserVersionService;
import com.skapp.enterprise.common.payload.response.EpVersionResponseDto;
import com.skapp.enterprise.common.service.EpVersionService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

@Service
@Primary
@RequiredArgsConstructor
public class EpVersionServiceImpl implements EpVersionService {

	private final UserVersionService userVersionService;

	private final SystemVersionService systemVersionService;

	@Override
	public EpVersionResponseDto getVersionsByUserId(Long employeeId) {
		String userVersion = userVersionService.getUserVersion(employeeId);
		String systemVersion = systemVersionService.getLatestSystemVersion();

		EpVersionResponseDto epVersionResponseDto = new EpVersionResponseDto();
		epVersionResponseDto.setUserId(employeeId);
		epVersionResponseDto.setUserVersion(userVersion);
		epVersionResponseDto.setSystemVersion(systemVersion);
		return epVersionResponseDto;
	}

}
