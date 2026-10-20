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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

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
		UserVersion userVersion = findOrCreateUserVersion(userId);
		String newVersion = VersionUtil.incrementVersion(userVersion.getVersion(), versionType);

		userVersion.setVersion(newVersion);
		userVersionDao.save(userVersion);

		CacheKeys cacheKey = CacheKeys.USER_VERSION_CACHE_KEY;
		cacheService.invalidate(cacheKey.format(userId));

		log.info("Cache invalidated user ID: {} after upgrading version to {}", userId, newVersion);
	}

	@Override
	@Transactional(readOnly = true)
	public long getSessionVersion(Long userId) {
		UserVersion userVersion = userVersionDao.findByUserId(userId);
		return userVersion != null ? sessionVersionOf(userVersion) : AuthConstants.DEFAULT_SESSION_VERSION;
	}

	@Override
	@Transactional
	public void revokeSessions(Long userId) {
		UserVersion userVersion = findOrCreateUserVersion(userId);
		String newVersion = VersionUtil.incrementVersion(userVersion.getVersion(), VersionType.MAJOR);

		userVersion.setVersion(newVersion);
		userVersion.setSessionVersion(sessionVersionOf(userVersion) + 1);
		userVersionDao.save(userVersion);

		cacheUserVersionAfterCommit(userId, newVersion);
	}

	private UserVersion findOrCreateUserVersion(Long userId) {
		UserVersion userVersion = userVersionDao.findByUserId(userId);
		if (userVersion != null) {
			return userVersion;
		}

		UserVersion newUserVersion = new UserVersion();
		newUserVersion.setUserId(userId);
		newUserVersion.setVersion(AuthConstants.DEFAULT_USER_VERSION);
		return newUserVersion;
	}

	private long sessionVersionOf(UserVersion userVersion) {
		Long sessionVersion = userVersion.getSessionVersion();
		return sessionVersion != null ? sessionVersion : AuthConstants.DEFAULT_SESSION_VERSION;
	}

	private void cacheUserVersionAfterCommit(Long userId, String version) {
		TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
			@Override
			public void afterCommit() {
				CacheKeys cacheKey = CacheKeys.USER_VERSION_CACHE_KEY;
				cacheService.put(cacheKey.format(userId), version, cacheKey.getTtl(), cacheKey.getTimeUnit());
			}
		});
	}

}
