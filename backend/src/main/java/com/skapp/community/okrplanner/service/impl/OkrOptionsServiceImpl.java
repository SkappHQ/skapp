package com.skapp.community.okrplanner.service.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.okrplanner.service.OkrOptionsService;
import com.skapp.community.okrplanner.type.OkrFrequency;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OkrOptionsServiceImpl implements OkrOptionsService {

	@Override
	public ResponseEntityDto getOkrFrequency() {
		log.info("getOkrFrequency: execution started");
		List<String> frequencies = Arrays.stream(OkrFrequency.values()).map(Enum::name).collect(Collectors.toList());
		log.info("getOkrFrequency: execution ended");
		return new ResponseEntityDto(false, frequencies);
	}

}
