package com.skapp.community.common.service.impl;

import com.skapp.community.common.constant.AuthConstants;
import com.skapp.community.common.model.UserVersion;
import com.skapp.community.common.repository.UserVersionDao;
import com.skapp.community.common.service.CacheService;
import com.skapp.community.common.service.UserVersionService;
import com.skapp.community.common.type.CacheKeys;
import com.skapp.community.common.type.VersionType;
import com.skapp.community.common.util.VersionUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserVersionServiceImpl implements UserVersionService {

	private final UserVersionDao userVersionDao;

	private final CacheService cacheService;

	@Override
	public String getUserVersion(Long userId) {
		CacheKeys cacheKey = CacheKeys.USER_VERSION_CACHE_KEY;

		String cachedVersion = cacheService.get(cacheKey.format(userId));
		if (cachedVersion != null) {
			return cachedVersion;
		}

		UserVersion userVersion = userVersionDao.findByUserId(userId);
		String version = (userVersion != null) ? userVersion.getVersion() : AuthConstants.DEFAULT_USER_VERSION;

		cacheService.put(cacheKey.format(userId), version, cacheKey.getTtl(), cacheKey.getTimeUnit());
		return version;
	}

	@Override
	public void upgradeUserVersion(Long userId, VersionType versionType) {
		UserVersion userVersion = userVersionDao.findByUserId(userId);
		String currentVersion = (userVersion != null) ? userVersion.getVersion() : AuthConstants.DEFAULT_USER_VERSION;
		String newVersion = VersionUtil.incrementVersion(currentVersion, versionType);

		if (userVersion == null) {
			userVersion = new UserVersion();
			userVersion.setUserId(userId);
		}

		userVersion.setVersion(newVersion);
		userVersionDao.save(userVersion);

		CacheKeys cacheKey = CacheKeys.USER_VERSION_CACHE_KEY;
		cacheService.invalidate(cacheKey.format(userId));

		log.info("Cache invalidated user ID: {} after upgrading version to {}", userId, newVersion);
	}

}
