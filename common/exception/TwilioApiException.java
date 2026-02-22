package com.skapp.enterprise.common.exception;

import lombok.Getter;

@Getter
public class TwilioApiException extends RuntimeException {

	private final int statusCode;

	private final String twilioMessage;

	public TwilioApiException(String message, int statusCode, String twilioMessage, Throwable cause) {
		super(message, cause);
		this.statusCode = statusCode;
		this.twilioMessage = twilioMessage;
	}

}
