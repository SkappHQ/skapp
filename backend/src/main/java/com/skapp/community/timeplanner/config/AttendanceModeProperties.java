package com.skapp.community.timeplanner.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@Configuration
@ConfigurationProperties(prefix = "attendance.clock-in-out-only")
public class AttendanceModeProperties {

	/**
	 * Restricts attendance to clock-in/clock-out for the whole deployment
	 * (community/single-tenant switch).
	 */
	private boolean enabled;

	/**
	 * Tenant names restricted to clock-in/clock-out only (enterprise). Evaluated
	 * case-insensitively against the current tenant.
	 */
	private List<String> tenants = new ArrayList<>();

}
