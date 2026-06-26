package com.skapp.community.common.exception;

import com.skapp.community.common.constant.MessageConstant;
import com.skapp.community.common.util.MessageUtil;
import lombok.Getter;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicReference;

@Getter
public class TooManyRequestsException extends RuntimeException {

	private static final AtomicReference<MessageUtil> messageUtil = new AtomicReference<>();

	private final transient MessageConstant messageKey;

	public TooManyRequestsException(MessageConstant messageKey) {
		super(getMessageUtil().getMessage(messageKey.getMessageKey()));
		this.messageKey = messageKey;
	}

	public TooManyRequestsException(MessageConstant messageKey, Object[] args) {
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
