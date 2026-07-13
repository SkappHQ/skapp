package com.skapp.community.common.exception;

import com.skapp.community.common.constant.MessageConstant;
import com.skapp.community.common.util.MessageUtil;
import lombok.Getter;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicReference;

/**
 * Signals a server-side / operational fault that is <b>not</b> the caller's fault — a
 * required resource is unavailable or an internal invariant is broken (e.g. an encryption
 * key failed to load, a stored value is corrupt). Surfaces as HTTP 500 through
 * {@code GlobalExceptionHandler}, which also unwraps it when it is rethrown from inside a
 * JPA flush/load and rewrapped by Hibernate.
 *
 * <p>
 * Contrast with {@link ModuleException}, which maps to HTTP 400 (a client error). Use
 * this type when the request itself is valid but the server cannot fulfil it. Carries a
 * {@link MessageConstant} key so the message flows through the standard
 * message-properties mechanism, keeping every error string in one place.
 * </p>
 */
@Getter
public class InternalServerException extends RuntimeException {

	private static final AtomicReference<MessageUtil> messageUtil = new AtomicReference<>();

	private final transient MessageConstant messageKey;

	public InternalServerException(MessageConstant messageKey, Object... args) {
		super(getMessageUtil().getMessage(messageKey.getMessageKey(), args));
		this.messageKey = messageKey;
	}

	private static MessageUtil getMessageUtil() {
		MessageUtil util = messageUtil.get();
		if (util == null) {
			throw new IllegalStateException("MessageUtil not initialized");
		}
		return util;
	}

	@Component
	public static class MessageUtilInjector implements ApplicationContextAware {

		@Override
		public void setApplicationContext(ApplicationContext applicationContext) {
			messageUtil.set(applicationContext.getBean(MessageUtil.class));
		}

	}

}
