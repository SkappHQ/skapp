package com.skapp.community.common.exception;

import com.skapp.community.common.constant.MessageConstant;

public class ConflictException extends ModuleException {

	public ConflictException(MessageConstant messageKey) {
		super(messageKey);
	}

	public ConflictException(MessageConstant messageKey, Object[] args) {
		super(messageKey, args);
	}

}
