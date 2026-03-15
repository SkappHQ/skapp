package com.skapp.enterprise.esignature.service;

import com.skapp.enterprise.esignature.payload.response.DocumentHashRepairResponseDto;

import java.time.LocalDate;

public interface EsMigrationService {

	/**
	 * Repair document hashes and signatures for all completed envelopes on or after
	 * {@code startDate} for the current tenant. Downloads each document's current version
	 * from S3, recomputes SHA3-256 hash and ECDSA signature, and updates mismatches in
	 * the database.
	 * @param startDate only envelopes completed on or after this date are processed
	 * @return a summary of the repair run
	 */
	DocumentHashRepairResponseDto repairDocumentHashes(LocalDate startDate);

}
