package com.skapp.community.common.util;

import lombok.experimental.UtilityClass;

import java.util.Arrays;
import java.util.stream.Collectors;

// Sample output (GlobalExceptionHandler):
//
// ==================== Global Exception Occurred ====================
// Method:              GET
// API Path:            /v1/employees/123
// Exception Type:      ModuleException
// Status Code:         404
// Key:                 COMMON_ERROR_USER_NOT_FOUND
// Message:             User not found - AuthServiceImpl - performSignIn
// Stack Trace:
//     com.skapp.community.common.service.impl.AuthServiceImpl.performSignIn(AuthServiceImpl.java:191)
//     sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
//     sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
//     ...up to 5 frames
// =====================================================================
//
// Sample output (ExceptionLoggingFilter):
//
// ==================== Filter Exception Occurred ====================
// Method:              POST
// API Path:            /v1/auth/sign-in
// Exception Type:      BadCredentialsException
// Message:             Bad credentials - ProviderManager - authenticate
// Stack Trace:
//     org.springframework.security.authentication.ProviderManager.authenticate(ProviderManager.java:120)
//     org.springframework.security.authentication.ProviderManager.authenticate(ProviderManager.java:112)
//     com.skapp.community.common.service.impl.AuthServiceImpl.performSignIn(AuthServiceImpl.java:178)
//     ...up to 5 frames
// =====================================================================
@UtilityClass
public class ExceptionLogFormatter {

	private static final String BANNER_FORMAT = "==================== %s Occurred ====================";

	private static final String SEPARATOR = "=====================================================================";

	private static final int STACK_TRACE_LIMIT = 5;

	public String format(String source, String method, String apiPath, Exception e, String messageKey,
			Integer statusCode) {

		StringBuilder log = new StringBuilder();
		log.append("\n");

		appendLine(log, BANNER_FORMAT.formatted(source));
		appendField(log, "Method", method);
		appendField(log, "API Path", apiPath);
		appendField(log, "Exception Type", e.getClass().getSimpleName());
		appendFieldIfNotNull(log, "Status Code", statusCode);
		appendFieldIfNotNull(log, "Key", messageKey);
		appendField(log, "Message", buildMessage(e));
		appendStackTrace(log, e.getStackTrace());

		log.append(SEPARATOR);
		return log.toString();
	}

	private String buildMessage(Exception e) {
		StringBuilder message = new StringBuilder();
		message.append(e.getMessage());

		if (e.getCause() != null) {
			message.append(" - ").append(e.getCause().getMessage());
		}
		if (e.getSuppressed().length > 0) {
			message.append(" - ").append(e.getSuppressed()[0].getMessage());
		}
		if (e.getStackTrace().length > 0) {
			message.append(" - ")
				.append(e.getStackTrace()[0].getClassName())
				.append(" - ")
				.append(e.getStackTrace()[0].getMethodName());
		}

		return message.toString();
	}

	private void appendField(StringBuilder log, String label, Object value) {
		log.append(String.format("%-21s%s%n", label + ":", value));
	}

	private void appendFieldIfNotNull(StringBuilder log, String label, Object value) {
		if (value != null) {
			appendField(log, label, value);
		}
	}

	private void appendLine(StringBuilder log, String line) {
		log.append(line).append("\n");
	}

	private void appendStackTrace(StringBuilder log, StackTraceElement[] stackTrace) {
		if (stackTrace.length > 0) {
			log.append(String.format("Stack Trace:%n    %s%n",
					Arrays.stream(stackTrace)
						.limit(STACK_TRACE_LIMIT)
						.map(StackTraceElement::toString)
						.collect(Collectors.joining("\n    "))));
		}
	}

}
