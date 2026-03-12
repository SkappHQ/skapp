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

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EsMigrationServiceImpl implements EsMigrationService {

	/**
	 * Only process envelopes completed on or after this date.
	 */
	private static final LocalDateTime CUTOFF_DATE = LocalDateTime.of(2026, 1, 1, 0, 0, 0);

	private final EnvelopeDao envelopeDao;

	private final TenantContext tenantContext;

	/**
	 * Separate Spring bean so that @Transactional(REQUIRES_NEW) is honoured per document
	 * without self-invocation issues.
	 */
	private final DocumentHashRepairProcessor repairProcessor;

	// -------------------------------------------------------------------------
	// Public API
	// -------------------------------------------------------------------------

	@Override
	public DocumentHashRepairResponseDto repairDocumentHashes(String tenantId) {
		log.info("[EsMigration] Starting document hash repair for tenant: {}", tenantId);

		tenantContext.setTenantAndSwitchSchema(tenantId);

		DocumentHashRepairResponseDto response = new DocumentHashRepairResponseDto();
		response.setTenant(tenantId);

		List<Envelope> envelopes = envelopeDao.findByStatusAndCompletedAtGreaterThanEqual(EnvelopeStatus.COMPLETED,
				CUTOFF_DATE);

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
