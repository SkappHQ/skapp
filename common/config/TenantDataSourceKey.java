package com.skapp.enterprise.common.config;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class TenantDataSourceKey {

	private String tenantId;

	private boolean isRead;

}
