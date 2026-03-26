package com.skapp.enterprise.esignature.service;

import java.time.LocalDate;

public interface EsMigrationService {

	/**
	 * Asynchronously repair document hashes and signatures for all completed envelopes on
	 * or after {@code startDate} for the current tenant. Downloads each document's
	 * current version from S3, recomputes SHA3-256 hash and ECDSA signature, and updates
	 * mismatches in the database.
	 * <p>
	 * Progress and results are tracked via the {@code jobId} in
	 * {@link com.skapp.enterprise.esignature.service.impl.RepairJobTracker}.
	 * @param startDate only envelopes completed on or after this date are processed
	 * @param jobId the job identifier for tracking progress
	 */
	void repairDocumentHashesAsync(LocalDate startDate, String jobId);

}
