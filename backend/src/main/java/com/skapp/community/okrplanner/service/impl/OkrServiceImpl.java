package com.skapp.community.okrplanner.service.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.okrplanner.constant.OkrMessageConstant;
import com.skapp.community.okrplanner.model.OkrConfig;
import com.skapp.community.okrplanner.payload.OkrConfigDto;
import com.skapp.community.okrplanner.repository.OkrConfigDao;
import com.skapp.community.okrplanner.service.OkrService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OkrServiceImpl implements OkrService {

	private final MessageUtil messageUtil;

	private final OkrConfigDao okrConfigDao;

	@Override
	public ResponseEntityDto getOkrConfiguration() {
		log.info("getOkrConfiguration: execution started");

		ResponseEntityDto responseEntityDto;

		List<OkrConfig> okrConfig = okrConfigDao.findAll();
		if (okrConfig.isEmpty()) {
			responseEntityDto = new ResponseEntityDto(false, null);
		}
		else {
			responseEntityDto = new ResponseEntityDto(false, okrConfig.getFirst());
		}

		log.info("getOkrConfiguration: execution ended");
		return responseEntityDto;
	}

	@Override
	public ResponseEntityDto upsertOkrConfiguration(OkrConfigDto okrConfigDto) {
		log.info("upsertOkrConfiguration: execution started");

		List<OkrConfig> okrConfigs = okrConfigDao.findAll();
		OkrConfig okrConfig;
		if (okrConfigs.isEmpty()) {
			okrConfig = new OkrConfig();
		}
		else {
			okrConfig = okrConfigs.getFirst();
		}
		okrConfig.setFrequency(okrConfigDto.getFrequency());
		okrConfigDao.save(okrConfig);

		log.info("upsertOkrConfiguration: execution ended");
		return new ResponseEntityDto(messageUtil.getMessage(OkrMessageConstant.OKR_SUCCESS_OKR_CONFIG_UPDATED), false);
	}

}
