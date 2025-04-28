package com.skapp.enterprise.common.service.impl;

import com.skapp.enterprise.common.component.event.handler.QuartzJobHandler;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.service.ScheduleService;
import com.skapp.enterprise.common.type.QuartzEntityType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.SimpleScheduleBuilder;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduleServiceImpl implements ScheduleService {

	public static final String ENTITY_ID = "entityId";

	public static final String JOB_TENANT_ID = "tenantId";

	public static final String ENTITY_TYPE = "entityType";

	private final Scheduler scheduler;

	private final TenantContext tenantContext;

	@Override
	public void scheduleExpiration(Long entityId, String tenantId, QuartzEntityType entityType,
			LocalDateTime expireAt) {
		try {
			tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);

			String entityTypeName = entityType.name();

			JobDetail jobDetail = JobBuilder.newJob(QuartzJobHandler.class)
				.withIdentity(entityTypeName + "-expire-" + entityId, "expiration")
				.storeDurably(true)
				.usingJobData(ENTITY_ID, entityId)
				.usingJobData(JOB_TENANT_ID, tenantId)
				.usingJobData(ENTITY_TYPE, entityTypeName)
				.build();

			Trigger trigger = TriggerBuilder.newTrigger()
				.withIdentity("trigger-" + entityTypeName + "-expire-" + entityId, "expiration")
				.forJob(jobDetail)
				.startAt(Date.from(expireAt.toInstant(ZoneOffset.UTC)))
				.withSchedule(SimpleScheduleBuilder.simpleSchedule()
					.withMisfireHandlingInstructionFireNow()
					.withRepeatCount(0))
				.build();

			scheduler.scheduleJob(jobDetail, trigger);
			tenantContext.setTenantAndSwitchSchema(tenantId);
			log.info("Scheduled expiration job for {} with ID: {} in tenant: {}", entityTypeName, entityId, tenantId);
		}
		catch (SchedulerException e) {
			log.error("Failed to schedule expiration job for entity ID: {} in tenant: {}", entityId, tenantId, e);
		}
	}

}
