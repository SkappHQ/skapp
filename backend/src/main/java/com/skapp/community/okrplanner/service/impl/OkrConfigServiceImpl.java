package com.skapp.community.okrplanner.service.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.okrplanner.model.OkrConfig;
import com.skapp.community.okrplanner.payload.OkrConfigDto;
import com.skapp.community.okrplanner.repository.OkrConfigDao;
import com.skapp.community.okrplanner.service.OkrConfigService;
import com.skapp.community.okrplanner.type.OkrFrequency;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OkrConfigServiceImpl implements OkrConfigService {

	private final OkrConfigDao okrConfigDao;

	@Override
	public ResponseEntityDto getOkrConfiguration() {
		log.info("getOkrConfiguration: execution started");
		Optional<OkrConfig> okrConfig = okrConfigDao.findFirstBy();
		ResponseEntityDto responseEntityDto = new ResponseEntityDto(false, okrConfig.orElse(null));
		log.info("getOkrConfiguration: execution ended");
		return responseEntityDto;
	}

	@Override
	public ResponseEntityDto updateOkrConfiguration(OkrConfigDto okrConfigDto) {
		log.info("updateOkrConfiguration: execution started");
		OkrConfig okrConfig = okrConfigDao.findFirstBy().orElse(null);
		if (okrConfig == null) {
			log.info("updateOkrConfiguration: No configuration found");
			return new ResponseEntityDto(false, null);
		}
		okrConfig.setFrequency(okrConfigDto.getFrequency());
		OkrConfig savedConfig = okrConfigDao.save(okrConfig);
		log.info("updateOkrConfiguration: execution ended");
		return new ResponseEntityDto(false, savedConfig);
	}

	@Override
	public void setOkrDefaultConfig() {
		log.info("setOkrDefaultConfig: execution started");
		OkrConfig defaultOkrConfig = new OkrConfig();
		defaultOkrConfig.setFrequency(OkrFrequency.ANNUAL);
		okrConfigDao.save(defaultOkrConfig);
		log.info("setOkrDefaultConfig: execution ended");
	}

}
