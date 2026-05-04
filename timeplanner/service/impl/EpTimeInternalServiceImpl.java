package com.skapp.enterprise.timeplanner.service.impl;

import com.skapp.community.timeplanner.mapper.TimeMapper;
import com.skapp.community.timeplanner.model.TimeConfig;
import com.skapp.community.timeplanner.payload.response.TimeConfigResponseDto;
import com.skapp.community.timeplanner.repository.TimeConfigDao;
import com.skapp.enterprise.timeplanner.service.EpTimeInternalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class EpTimeInternalServiceImpl implements EpTimeInternalService {

	private final TimeConfigDao timeConfigDao;

	private final TimeMapper timeMapper;

	@Override
	@Transactional(readOnly = true)
	public List<TimeConfigResponseDto> getOrganizationTimeConfigs() {
		log.info("getOrganizationTimeConfigs: execution started");

		List<TimeConfig> timeConfigs = timeConfigDao.findAll();
		List<TimeConfigResponseDto> mappedConfigs = new ArrayList<>();

		for (TimeConfig tc : timeConfigs) {
			if (tc.getStartHour() == null) {
				tc.setStartHour(0);
			}
			if (tc.getStartMinute() == null) {
				tc.setStartMinute(0);
			}
			mappedConfigs.add(timeMapper.timeConfigToTimeConfigResponseDto(tc));
		}

		List<TimeConfigResponseDto> sortedConfigs = new ArrayList<>();
		for (DayOfWeek day : DayOfWeek.values()) {
			mappedConfigs.stream().filter(tc -> day.equals(tc.getDay())).findFirst().ifPresent(sortedConfigs::add);
		}

		log.info("getOrganizationTimeConfigs: returning {} time configs", sortedConfigs.size());
		return sortedConfigs;
	}

}
