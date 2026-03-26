package com.skapp.enterprise.esignature.service.impl;

import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.payload.response.DocumentHashRepairResponseDto;
import com.skapp.enterprise.esignature.payload.response.RepairJobDto;
import com.skapp.enterprise.esignature.repository.EnvelopeDao;
import com.skapp.enterprise.esignature.service.EsMigrationDocumentRepairAsyncService;
import com.skapp.enterprise.esignature.service.EsMigrationDocumentRepairService;
import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Asynchronous orchestrator for the document hash repair job. Queries completed envelopes
 * for the current tenant, iterates their documents, and delegates each individual repair
 * to {@link EsMigrationDocumentRepairService} (which runs in its own transaction).
 * <p>
 * Extracted into a separate Spring bean so that the {@link Async} proxy is honoured when
 * called from {@link EsMigrationServiceImpl} (avoids self-invocation proxy bypass).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EsMigrationDocumentRepairAsyncServiceImpl implements EsMigrationDocumentRepairAsyncService {

	private final EnvelopeDao envelopeDao;

	private final TenantContext tenantContext;

	private final EsMigrationDocumentRepairService esMigrationDocumentRepairService;

	@Override
	@Async
	public void repairDocumentHashesAsync(LocalDate startDate, RepairJobDto job, RepairJobTracker repairJobTracker) {

		String tenantId = TenantContext.getCurrentTenant();
		DocumentHashRepairResponseDto response = new DocumentHashRepairResponseDto();
		response.setTenant(tenantId);

		String jobId = job.getJobId();

		try {
			repairJobTracker.markRunning(jobId);

			tenantContext.setTenantAndSwitchSchema(tenantId);

			LocalDateTime cutoffDate = startDate.atStartOfDay();
			log.info("[EsMigration] Starting document hash repair for tenant: {} from {}", tenantId, cutoffDate);

			List<Envelope> envelopes = envelopeDao.findByStatusAndCompletedAtGreaterThanEqual(EnvelopeStatus.COMPLETED,
					cutoffDate);

			response.setTotalEnvelopes(envelopes.size());
			log.info("[EsMigration] Found {} completed envelopes for tenant: {}", envelopes.size(), tenantId);

			int totalDocuments = 0;
			for (Envelope envelope : envelopes) {
				if (envelope.getDocuments() == null || envelope.getDocuments().isEmpty()) {
					continue;
				}
				for (Document document : envelope.getDocuments()) {
					totalDocuments++;
					esMigrationDocumentRepairService.repairDocument(envelope, document, response);
				}
			}

			response.setTotalDocuments(totalDocuments);
			log.info(
					"[EsMigration] Repair complete for tenant '{}' — envelopes: {}, documents: {}, repaired: {}, skipped: {}, failed: {}",
					tenantId, response.getTotalEnvelopes(), response.getTotalDocuments(), response.getRepaired(),
					response.getSkipped(), response.getFailed());

			repairJobTracker.markCompleted(jobId, response);
		}
		catch (Exception ex) {
			log.error("[EsMigration] Repair job {} failed for tenant '{}': {}", jobId, tenantId, ex.getMessage(), ex);
			repairJobTracker.markFailed(jobId, response);
		}
	}

}
