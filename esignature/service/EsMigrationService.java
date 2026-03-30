package com.skapp.enterprise.esignature.service;

import com.skapp.enterprise.esignature.payload.response.RepairJobDto;

import java.time.LocalDate;

public interface EsMigrationService {

	/**
	 * Create a new repair job and asynchronously start the document hash repair for all
	 * completed envelopes on or after {@code startDate} for the current tenant.
	 * @param startDate only envelopes completed on or after this date are processed
	 * @return the created job with a PENDING status and a job ID for polling
	 */
	RepairJobDto startRepairJob(LocalDate startDate);

	/**
	 * Retrieve the current status and results of a previously started repair job.
	 * @param jobId the job identifier returned by the repair initiation endpoint
	 * @return the job status and results
	 * @throws com.skapp.community.common.exception.ModuleException if no job exists for
	 * the given ID or the cached value cannot be deserialized
	 */
	RepairJobDto getRepairJobStatus(String jobId);

}
