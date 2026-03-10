package com.skapp.enterprise.common.service;

import com.skapp.enterprise.common.type.TelemetrySeverity;

import java.util.Map;

// Abstraction for sending application signals (exceptions, messages) to external
// monitoring platforms such as Sentry, Google Analytics, or similar services.
// Current implementation: EpSentryTelemetryServiceImpl
public interface TelemetryService {

	void report(Exception e);

	void report(String message, TelemetrySeverity severity, Map<String, String> tags, Map<String, String> extras);

}
