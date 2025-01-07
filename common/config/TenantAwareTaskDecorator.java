package com.skapp.enterprise.common.config;

import lombok.NonNull;
import org.springframework.core.task.TaskDecorator;

public class TenantAwareTaskDecorator implements TaskDecorator {

	@Override
	@NonNull
	public Runnable decorate(@NonNull Runnable task) {
		String currentTenant = TenantContext.getCurrentTenant();

		return () -> {
			try {
				TenantContext.setCurrentTenant(currentTenant);
				task.run();
			}
			finally {
				TenantContext.clearCurrentTenant();
			}
		};
	}

}
