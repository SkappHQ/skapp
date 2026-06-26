package com.skapp.community.common.service;

import com.skapp.community.common.type.VersionType;

public interface UserVersionService {

	void upgradeUserVersion(Long userId, VersionType versionType);

	String getUserVersion(Long userId);

}
