package com.skapp.community.common.service.impl;

import com.skapp.community.common.constant.AuthConstants;
import com.skapp.community.common.model.SystemVersion;
import com.skapp.community.common.repository.SystemVersionDao;
import com.skapp.community.common.service.CacheService;
import com.skapp.community.common.service.SystemVersionService;
import com.skapp.community.common.type.CacheKeys;
import com.skapp.community.common.type.SystemVersionTypes;
import com.skapp.community.common.type.VersionType;
import com.skapp.community.common.util.VersionUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemVersionServiceImpl implements SystemVersionService {

	private final SystemVersionDao systemVersionDao;

	private final CacheService cacheService;

	@Override
	@Transactional(readOnly = true)
	public String getLatestSystemVersion() {
		CacheKeys cacheKey = CacheKeys.SYSTEM_VERSION_CACHE_KEY;

		String cachedVersion = cacheService.get(cacheKey.getKey());
		if (cachedVersion != null) {
			return cachedVersion;
		}

		SystemVersion latestVersion = systemVersionDao.findFirstByOrderByCreatedDateDesc();
		String version = (latestVersion != null) ? latestVersion.getVersion() : AuthConstants.DEFAULT_SYSTEM_VERSION;

		cacheService.put(cacheKey.getKey(), version, cacheKey.getTtl(), cacheKey.getTimeUnit());

		return version;
	}

	@Override
	public void upgradeSystemVersion(VersionType versionType, SystemVersionTypes systemVersionType) {
		SystemVersion latestVersion = systemVersionDao.findFirstByOrderByCreatedDateDesc();
		String currentVersion = (latestVersion != null) ? latestVersion.getVersion()
				: AuthConstants.DEFAULT_SYSTEM_VERSION;
		String newVersion = VersionUtil.incrementVersion(currentVersion, versionType);

		SystemVersion newSystemVersion = new SystemVersion();
		newSystemVersion.setVersion(newVersion);
		newSystemVersion.setReason(systemVersionType);
		systemVersionDao.save(newSystemVersion);

		CacheKeys cacheKey = CacheKeys.SYSTEM_VERSION_CACHE_KEY;
		cacheService.invalidate(cacheKey.getKey());

		log.info("Cache invalidated after upgrading version to {}", newVersion);
	}

}
