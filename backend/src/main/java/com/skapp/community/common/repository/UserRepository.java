package com.skapp.community.common.repository;

import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface UserRepository {

	int consumeTempPassword(Long userId, Instant now);

}
