package com.skapp.enterprise.common.service.impl;

import com.skapp.enterprise.common.service.TelemetryService;
import com.skapp.enterprise.common.type.TelemetrySeverity;
import io.sentry.Sentry;
import io.sentry.SentryLevel;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class EpSentryTelemetryServiceImpl implements TelemetryService {

	@Override
	public void report(Exception e) {
		Sentry.captureException(e);
	}

	@Override
	public void report(String message, TelemetrySeverity severity, Map<String, String> tags,
			Map<String, String> extras) {
		Sentry.withScope(scope -> {
			tags.forEach(scope::setTag);
			extras.forEach(scope::setExtra);
			scope.setLevel(toSentryLevel(severity));
			Sentry.captureMessage(message);
		});
	}

	private SentryLevel toSentryLevel(TelemetrySeverity severity) {
		return switch (severity) {
			case INFO -> SentryLevel.INFO;
			case WARNING -> SentryLevel.WARNING;
			case ERROR -> SentryLevel.ERROR;
		};
	}

}
