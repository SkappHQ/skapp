package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.payload.response.RepairJobDto;
import com.skapp.enterprise.esignature.service.EsMigrationDocumentRepairAsyncService;
import com.skapp.enterprise.esignature.service.EsMigrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class EsMigrationServiceImpl implements EsMigrationService {

	/**
	 * Separate Spring bean so that @Transactional(REQUIRES_NEW) is honoured per document
	 * without self-invocation issues.
	 */
	private final EsMigrationDocumentRepairAsyncService esMigrationDocumentRepairAsyncService;

	private final RepairJobTracker repairJobTracker;

	// -------------------------------------------------------------------------
	// Async repair orchestration
	// -------------------------------------------------------------------------

	@Override
	public RepairJobDto startRepairJob(LocalDate startDate) {
		RepairJobDto job = repairJobTracker.createJob();
		esMigrationDocumentRepairAsyncService.repairDocumentHashesAsync(startDate, job, repairJobTracker);
		return job;
	}

	@Override
	public RepairJobDto getRepairJobStatus(String jobId) {
		RepairJobDto job = repairJobTracker.getJob(jobId);
		if (job == null) {
			throw new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_REPAIR_JOB_NOT_FOUND);
		}
		return job;
	}

}
