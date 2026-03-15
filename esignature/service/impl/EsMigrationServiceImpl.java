package com.skapp.enterprise.esignature.service.impl;

import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.payload.response.DocumentHashRepairResponseDto;
import com.skapp.enterprise.esignature.repository.EnvelopeDao;
import com.skapp.enterprise.esignature.service.EsMigrationService;
import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EsMigrationServiceImpl implements EsMigrationService {

	private final EnvelopeDao envelopeDao;

	/**
	 * Separate Spring bean so that @Transactional(REQUIRES_NEW) is honoured per document
	 * without self-invocation issues.
	 */
	private final DocumentHashRepairProcessor repairProcessor;

	// -------------------------------------------------------------------------
	// Internal Use Only API
	// -------------------------------------------------------------------------

	@Override
	public DocumentHashRepairResponseDto repairDocumentHashes(LocalDate startDate) {

		String tenantId = TenantContext.getCurrentTenant();
		LocalDateTime cutoffDate = startDate.atStartOfDay();

		log.info("[EsMigration] Starting document hash repair for tenant: {} from {}", tenantId, cutoffDate);

		DocumentHashRepairResponseDto response = new DocumentHashRepairResponseDto();
		response.setTenant(tenantId);

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
				repairProcessor.repairDocument(envelope, document, response);
			}
		}

		response.setTotalDocuments(totalDocuments);
		log.info(
				"[EsMigration] Repair complete for tenant '{}' — envelopes: {}, documents: {}, repaired: {}, skipped: {}, failed: {}",
				tenantId, response.getTotalEnvelopes(), response.getTotalDocuments(), response.getRepaired(),
				response.getSkipped(), response.getFailed());

		return response;
	}

}
