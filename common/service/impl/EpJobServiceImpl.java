package com.skapp.enterprise.common.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.service.CacheService;
import com.skapp.community.peopleplanner.model.JobFamily;
import com.skapp.community.peopleplanner.model.JobTitle;
import com.skapp.community.peopleplanner.repository.JobFamilyDao;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.mapper.EpCommonMapper;
import com.skapp.enterprise.common.payload.response.EpJobResponseDto;
import com.skapp.enterprise.common.service.EpJobService;
import com.skapp.enterprise.common.type.EpCacheKeys;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Primary
@RequiredArgsConstructor
public class EpJobServiceImpl implements EpJobService {

	private final JobFamilyDao jobFamilyDao;

	private final EpCommonMapper epCommonMapper;

	private final ObjectMapper objectMapper;

	private final CacheService cacheService;

	@Override
	public List<EpJobResponseDto> getJobs() {
		List<JobFamily> jobFamilies = jobFamilyDao.getJobFamiliesByEmployeeCount();
		for (JobFamily jobFamily : jobFamilies) {
			jobFamily.setJobTitles(filterActiveJobTitles(jobFamily.getJobTitles()));
		}

		List<EpJobResponseDto> jobFamilyResponseDetailDtos = epCommonMapper
			.jobFamilyListToEpJobResponseDtoList(jobFamilies);

		try {
			String jobsJson = objectMapper.writeValueAsString(jobFamilyResponseDetailDtos);
			EpCacheKeys cacheKey = EpCacheKeys.TENANT_ALL_JOBS_CACHE_KEY;
			cacheService.put(cacheKey.getKey(), jobsJson, cacheKey.getTtl(), cacheKey.getTimeUnit());
		}
		catch (JsonProcessingException e) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_JSON_STRING_TO_OBJECT_CONVERSION_FAILED);
		}

		return jobFamilyResponseDetailDtos;
	}

	private Set<JobTitle> filterActiveJobTitles(Set<JobTitle> jobTitles) {
		return jobTitles.stream().filter(JobTitle::getIsActive).collect(Collectors.toSet());
	}

}
