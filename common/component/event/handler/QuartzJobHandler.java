package com.skapp.enterprise.common.component.event.handler;

import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.type.QuartzEntityType;
import com.skapp.enterprise.esignature.service.EnvelopeService;
import com.skapp.enterprise.invoice.service.InvoiceService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@AllArgsConstructor
public class QuartzJobHandler implements Job {

	public static final String ENTITY_ID = "entityId";

	public static final String JOB_TENANT_ID = "tenantId";

	public static final String ENTITY_TYPE = "entityType";

	private final TenantContext tenantContext;

	private final EnvelopeService envelopeService;

	private final InvoiceService invoiceService;

	@Override
	@Transactional
	public void execute(JobExecutionContext context) {
		Long entityId = context.getJobDetail().getJobDataMap().getLong(ENTITY_ID);
		String tenantId = context.getJobDetail().getJobDataMap().getString(JOB_TENANT_ID);
		String entityTypeStr = context.getJobDetail().getJobDataMap().getString(ENTITY_TYPE);

		try {
			tenantContext.setTenantAndSwitchSchema(tenantId);

			QuartzEntityType entityType = QuartzEntityType.convertToUpperCase(entityTypeStr);
			if (entityType == null) {
				log.warn("Unknown or null entity type for expiration: {}", entityTypeStr);
				return;
			}

			switch (entityType) {
				case ENVELOPE -> envelopeService.expireEnvelope(entityId);
				case INVOICE -> invoiceService.handleInvoiceExpiration(entityId);
				default -> log.warn("No handler implemented for entity type: {}", entityType);
			}

		}
		catch (Exception e) {
			log.error("Error executing expiration job for {} ID: {} in tenant: {}", entityTypeStr, entityId, tenantId,
					e);
		}
		finally {
			TenantContext.clearCurrentTenant();
		}
	}

}
