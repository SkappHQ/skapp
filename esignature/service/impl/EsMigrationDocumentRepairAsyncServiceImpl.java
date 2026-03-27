package com.skapp.enterprise.esignature.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.service.CacheService;
import com.skapp.community.common.type.CacheKeys;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.payload.response.DocumentHashRepairResponseDto;
import com.skapp.enterprise.esignature.payload.response.RepairJobDto;
import com.skapp.enterprise.esignature.repository.EnvelopeDao;
import com.skapp.enterprise.esignature.service.EsMigrationDocumentRepairAsyncService;
import com.skapp.enterprise.esignature.service.EsMigrationDocumentRepairService;
import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import com.skapp.enterprise.esignature.type.RepairJobStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
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

	private final EsMigrationDocumentRepairService esMigrationDocumentRepairService;

	@Override
	@Async
	public void repairDocumentHashesAsync(LocalDate startDate, RepairJobDto job) {

		esMigrationDocumentRepairService.repairDocument(startDate, job);
	}

}
