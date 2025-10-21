package com.skapp.enterprise.common.service;

import com.skapp.enterprise.common.type.QuartzEntityType;

import java.time.LocalDateTime;

public interface ScheduleService {

	void scheduleExpiration(Long entityId, String tenantId, QuartzEntityType entityType, LocalDateTime expireAt);

	void unScheduleExpiration(Long entityId, String tenantId, QuartzEntityType entityType);

}
