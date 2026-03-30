package com.skapp.enterprise.esignature.service.impl;

import com.skapp.enterprise.esignature.payload.response.RepairJobDto;
import com.skapp.enterprise.esignature.service.EsMigrationDocumentRepairAsyncService;
import com.skapp.enterprise.esignature.service.EsMigrationDocumentRepairService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

/**
 * Asynchronous wrapper for the document hash repair job. Delegates the entire repair
 * process to {@link EsMigrationDocumentRepairService#repairDocument}, which handles
 * querying envelopes, downloading documents, verifying integrity, and persisting fixes
 * within a single transaction.
 * <p>
 * Extracted into a separate Spring bean so that the {@link Async} proxy is honoured when
 * called from {@link EsMigrationServiceImpl} (avoids self-invocation proxy bypass).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EsMigrationDocumentRepairAsyncServiceImpl implements EsMigrationDocumentRepairAsyncService {

	private final EsMigrationDocumentRepairService esMigrationDocumentRepairService;

	@Override
	@Async
	public void repairDocumentHashesAsync(LocalDate startDate, RepairJobDto job) {

		esMigrationDocumentRepairService.repairDocument(startDate, job);
	}

}
