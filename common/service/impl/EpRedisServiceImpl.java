package com.skapp.enterprise.common.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.CacheService;
import com.skapp.community.common.type.CacheKey;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.mapper.EpCommonMapper;
import com.skapp.enterprise.common.service.EpRedisService;
import com.skapp.enterprise.common.payload.EpRedisEmployeeDto;
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

	@Override
	public ResponseEntityDto loadAllEmployeeData() {
		List<Employee> employees = employeeDao
			.findByAccountStatusIn(Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING));

		for (Employee employee : employees) {
			EpRedisEmployeeDto epRedisEmployeeDto = epCommonMapper.employeeToEpRedisEmployeeDto(employee);
			try {
				CacheKey cacheKey = EpCacheKeys.EMPLOYEE_DATA_CACHE_KEY;
				String value = objectMapper.writeValueAsString(epRedisEmployeeDto);
				cacheService.put(cacheKey.format(epRedisEmployeeDto.getUserId()), value, cacheKey.getTtl(),
						cacheKey.getTimeUnit());
			}
			catch (Exception e) {
				log.error("Failed to cache employee {}", epRedisEmployeeDto.getUserId(), e);
			}
		}

		log.info("All users and employees loaded to Redis for tenant {}", TenantContext.getCurrentTenant());
		return new ResponseEntityDto(false, "All users and employees loaded to Redis");
	}

}
