package com.skapp.enterprise.esignature.service;

import com.skapp.enterprise.esignature.payload.response.DocumentHashRepairResponseDto;

public interface EsMigrationService {

	/**
	 * Repair document hashes and signatures for all completed envelopes (since
	 * 2026-01-01) for the given tenant. Downloads each document's current version from
	 * S3, recomputes SHA3-256 hash and ECDSA signature, and updates mismatches in the
	 * database.
	 * @param tenantId the tenant schema to operate on
	 * @return a summary of the repair run
	 */
	DocumentHashRepairResponseDto repairDocumentHashes(String tenantId);

}
