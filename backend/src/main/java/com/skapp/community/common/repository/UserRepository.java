package com.skapp.community.common.repository;

import java.time.Instant;

public interface UserRepository {

	int consumeTempPassword(Long userId, Instant now);

}
