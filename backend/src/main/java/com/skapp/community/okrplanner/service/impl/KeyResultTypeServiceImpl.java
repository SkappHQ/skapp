package com.skapp.community.okrplanner.service.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.okrplanner.service.KeyResultTypeService;
import com.skapp.community.okrplanner.type.KeyResultType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class KeyResultTypeServiceImpl implements KeyResultTypeService {

	@Override
	public ResponseEntityDto getKeyResultTypes() {
		log.info("getKeyResultTypes: execution started");
		List<String> keyResultTypes = Arrays.stream(KeyResultType.values())
			.map(Enum::name)
			.collect(Collectors.toList());
		log.info("getKeyResultTypes: execution ended");
		return new ResponseEntityDto(false, keyResultTypes);
	}

}
