package com.skapp.community.okrplanner.service.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.okrplanner.model.OkrConfig;
import com.skapp.community.okrplanner.repository.OkrConfigDao;
import com.skapp.community.okrplanner.service.OkrOptionsService;
import com.skapp.community.okrplanner.type.OkrFrequency;
import com.skapp.community.okrplanner.type.OkrTimePeriod;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OkrOptionsServiceImpl implements OkrOptionsService {

	private final OkrConfigDao okrConfigDao;

	@Override
	public ResponseEntityDto getOkrFrequency() {
		log.info("getOkrFrequency: execution started");
		List<String> frequencies = Arrays.stream(OkrFrequency.values()).map(Enum::name).collect(Collectors.toList());
		log.info("getOkrFrequency: execution ended");
		return new ResponseEntityDto(false, frequencies);
	}

	@Override
	public ResponseEntityDto getOkrCompanyObjectiveTime() {
		log.info("getOkrCompanyObjectiveTime: execution started");
		Optional<OkrConfig> okrConfig = okrConfigDao.findFirstBy();
		List<String> timePeriods = new ArrayList<>();
		if (okrConfig.isPresent()) {
			timePeriods = OkrTimePeriod.getByType(okrConfig.get().getFrequency()).stream().map(Enum::name).toList();
		}
		log.info("getOkrCompanyObjectiveTime: execution ended");
		return new ResponseEntityDto(false, timePeriods);
	}

}
