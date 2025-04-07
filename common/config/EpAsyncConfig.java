package com.skapp.enterprise.common.config;

import lombok.NonNull;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.task.TaskDecorator;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.concurrent.Executor;

@Configuration
@Primary
public class EpAsyncConfig {

	@Bean(name = "taskExecutor")
	public Executor taskExecutor() {
		ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
		executor.setCorePoolSize(10);
		executor.setMaxPoolSize(20);
		executor.setQueueCapacity(500);
		executor.setThreadNamePrefix("Async-Thread-");
		executor.setTaskDecorator(new TenantContextTaskDecorator());
		executor.initialize();
		return executor;
	}

	static class TenantContextTaskDecorator implements TaskDecorator {

		@Override
		public @NonNull Runnable decorate(@NonNull Runnable task) {
			String tenantId = TenantContext.getCurrentTenant();
			SecurityContext securityContext = SecurityContextHolder.getContext();

			return () -> {
				try {
					TenantContext.setCurrentTenant(tenantId);
					SecurityContextHolder.setContext(securityContext);

					task.run();
				}
				finally {
					TenantContext.clearCurrentTenant();
					SecurityContextHolder.clearContext();
				}
			};
		}

	}

}
