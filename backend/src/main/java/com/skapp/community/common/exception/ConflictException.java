package com.skapp.community.common.exception;

import com.skapp.community.common.constant.MessageConstant;

/**
 * Thrown when a request conflicts with the current state of the resource (e.g. duplicate
 * unique values or concurrent modifications). Mapped to HTTP 409 by
 * {@link GlobalExceptionHandler}.
 */
public class ConflictException extends ModuleException {

	public ConflictException(MessageConstant messageKey) {
		super(messageKey);
	}

	public ConflictException(MessageConstant messageKey, Object[] args) {
		super(messageKey, args);
	}

}
