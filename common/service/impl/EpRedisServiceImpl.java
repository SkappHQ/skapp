package com.skapp.enterprise.common.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.CacheService;
import com.skapp.community.common.service.SystemVersionService;
import com.skapp.community.common.service.UserVersionService;
import com.skapp.community.common.type.CacheKey;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.mapper.EpCommonMapper;
import com.skapp.enterprise.common.payload.redis.EpRedisUserDto;
import com.skapp.enterprise.common.payload.redis.EpRedisUserVersionDto;
import com.skapp.enterprise.common.service.EpRedisService;
import com.skapp.enterprise.common.type.EpCacheKeys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class EpRedisServiceImpl implements EpRedisService {

	private final EmployeeDao employeeDao;

	private final CacheService cacheService;

	private final ObjectMapper objectMapper;

	private final EpCommonMapper epCommonMapper;

	private final SystemVersionService systemVersionService;

	private final UserVersionService userVersionService;

	@Override
	public ResponseEntityDto loadAllUserDataToRedis() {
		List<Employee> employees = employeeDao
			.findByAccountStatusIn(Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING));

		List<EpRedisUserDto> response = new java.util.ArrayList<>();

		for (Employee employee : employees) {
			EpRedisUserDto epRedisUserDto = epCommonMapper.employeeToEpRedisEmployeeDto(employee);
			response.add(epRedisUserDto);
			try {
				CacheKey cacheKey = EpCacheKeys.USER_DATA_CACHE_KEY;
				String value = objectMapper.writeValueAsString(epRedisUserDto);
				cacheService.put(cacheKey.format(epRedisUserDto.getUserId()), value, cacheKey.getTtl(),
						cacheKey.getTimeUnit());
			}
			catch (JsonProcessingException exception) {
				log.error("Failed to cache employee {}", epRedisUserDto.getUserId(), exception);
			}
		}

		log.info("All users loaded to Redis for tenant {}", TenantContext.getCurrentTenant());
		return new ResponseEntityDto(false, response);
	}

	@Override
	public ResponseEntityDto loadSystemVersionToRedis() {
		String latestSystemVersion = systemVersionService.getLatestSystemVersion();
		return new ResponseEntityDto(false, latestSystemVersion);
	}

	@Override
	public ResponseEntityDto loadAllUserVersionsToRedis() {
		List<Employee> employees = employeeDao
			.findByAccountStatusIn(Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING));

		List<EpRedisUserVersionDto> response = new java.util.ArrayList<>();

		for (Employee employee : employees) {
			EpRedisUserVersionDto epRedisUserVersionDto = new EpRedisUserVersionDto();
			epRedisUserVersionDto.setUserId(employee.getUser().getUserId());
			String latestUserVersion = userVersionService.getUserVersion(employee.getUser().getUserId());
			epRedisUserVersionDto.setUserVersion(latestUserVersion);
			response.add(epRedisUserVersionDto);
		}

		log.info("All user versions loaded to Redis for tenant {}", TenantContext.getCurrentTenant());
		return new ResponseEntityDto(false, response);
	}

}
