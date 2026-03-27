package com.skapp.enterprise.esignature.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.service.CacheService;
import com.skapp.community.common.type.CacheKeys;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.payload.response.RepairJobDto;
import com.skapp.enterprise.esignature.service.EsMigrationDocumentRepairAsyncService;
import com.skapp.enterprise.esignature.service.EsMigrationDocumentRepairService;
import com.skapp.enterprise.esignature.service.EsMigrationService;
import com.skapp.enterprise.esignature.type.RepairJobStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EsMigrationServiceImpl implements EsMigrationService {

	/**
	 * Async orchestrator for document hash repair. Extracted into a separate Spring bean
	 * so that the @Async proxy is honoured (avoids self-invocation proxy bypass).
	 */
	private final EsMigrationDocumentRepairAsyncService esMigrationDocumentRepairAsyncService;

	private final EsMigrationDocumentRepairService esMigrationDocumentRepairService;

	private final CacheService cacheService;

	// -------------------------------------------------------------------------
	// Async repair orchestration
	// -------------------------------------------------------------------------

	@Override
	public RepairJobDto startRepairJob(LocalDate startDate) {
		RepairJobDto job = createJob();
		esMigrationDocumentRepairAsyncService.repairDocumentHashesAsync(startDate, job);
		return job;
	}

	@Override
	public RepairJobDto getRepairJobStatus(String jobId) {
		return esMigrationDocumentRepairService.getRepairJobStatus(jobId);

	}

	private RepairJobDto createJob() {
		RepairJobDto job = new RepairJobDto();
		job.setJobId(UUID.randomUUID().toString());
		job.setStatus(RepairJobStatus.PENDING);
		job.setCreatedAt(Instant.now());
		job.setUpdatedAt(Instant.now());
		log.info("[RepairJob] Created job {}", job.getJobId());

		CacheKeys cacheKey = CacheKeys.ESIGN_MIGRATION_REPAIR_JOB_CACHE_KEY;
		cacheService.put(cacheKey.format(job.getJobId()), job.toString(), cacheKey.getTtl(), cacheKey.getTimeUnit());
		return job;
	}

}
