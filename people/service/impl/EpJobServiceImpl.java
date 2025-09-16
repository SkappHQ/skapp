package com.skapp.enterprise.people.service.impl;

import com.skapp.community.common.service.CacheService;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.peopleplanner.mapper.PeopleMapper;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.JobFamilyDao;
import com.skapp.community.peopleplanner.repository.JobFamilyTitleDao;
import com.skapp.community.peopleplanner.repository.JobTitleDao;
import com.skapp.community.peopleplanner.service.impl.JobServiceImpl;
import com.skapp.enterprise.common.type.EpCacheKeys;

public class EpJobServiceImpl extends JobServiceImpl {

	private final CacheService cacheService;

	public EpJobServiceImpl(JobFamilyDao jobFamilyDao, JobTitleDao jobTitleDao, JobFamilyTitleDao jobFamilyTitleDao,
			EmployeeDao employeeDao, PeopleMapper peopleMapper, MessageUtil messageUtil, CacheService cacheService) {
		super(jobFamilyDao, jobTitleDao, jobFamilyTitleDao, employeeDao, peopleMapper, messageUtil);
		this.cacheService = cacheService;
	}

	@Override
	protected void invalidateJobsCache() {
		EpCacheKeys cacheKey = EpCacheKeys.TENANT_ALL_JOBS_CACHE_KEY;
		cacheService.invalidate(cacheKey.getKey());
	}

}
