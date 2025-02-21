package com.skapp.enterprise.common.exception;

import com.skapp.community.common.constant.MessageConstant;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.enterprise.common.type.StripeWebhookEventTypes;
import com.stripe.model.Event;
import lombok.Getter;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicReference;

@Getter
public class StripeVerificationException extends RuntimeException {

	private final transient MessageConstant messageKey;

	private final transient Event event;

	private final String tenantName;

	private final StripeWebhookEventTypes eventType;

	private final String customerName;

	private final String customerId;

	private static final AtomicReference<MessageUtil> messageUtil = new AtomicReference<>();

	@Component
	public static class MessageUtilInjector implements ApplicationContextAware {

		@Override
		public void setApplicationContext(ApplicationContext applicationContext) {
			messageUtil.set(applicationContext.getBean(MessageUtil.class));
		}

	}

	public StripeVerificationException(MessageConstant messageKey, Event event, StripeWebhookEventTypes eventType) {
		super(getMessageUtil().getMessage(messageKey.getMessageKey()));
		this.messageKey = messageKey;
		this.event = event;
		this.eventType = eventType;
		this.tenantName = "";
		this.customerName = "";
		this.customerId = "";
	}

	public StripeVerificationException(MessageConstant messageKey, Event event, StripeWebhookEventTypes eventType,
			Object[] args) {
		super(getMessageUtil().getMessage(messageKey.getMessageKey(), args));
		this.messageKey = messageKey;
		this.event = event;
		this.eventType = eventType;
		this.tenantName = "";
		this.customerName = "";
		this.customerId = "";
	}

	public StripeVerificationException(MessageConstant messageKey, Event event, String customerName, String customerId,
			StripeWebhookEventTypes eventType, Object[] args) {
		super(getMessageUtil().getMessage(messageKey.getMessageKey(), args));
		this.messageKey = messageKey;
		this.event = event;
		this.eventType = eventType;
		this.tenantName = "";
		this.customerName = customerName;
		this.customerId = customerId;
	}

	public StripeVerificationException(MessageConstant messageKey, Event event, String tenantName, String customerName,
			String customerId, StripeWebhookEventTypes eventType) {
		super(getMessageUtil().getMessage(messageKey.getMessageKey()));
		this.messageKey = messageKey;
		this.event = event;
		this.tenantName = tenantName;
		this.customerName = customerName;
		this.customerId = customerId;
		this.eventType = eventType;
	}

	private static MessageUtil getMessageUtil() {
		MessageUtil util = messageUtil.get();
		if (util == null) {
			throw new IllegalStateException("MessageUtil not initialized");
		}
		return util;
	}

}
