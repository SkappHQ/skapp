package com.skapp.enterprise.common.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum StripeSubscriptionType {

	CANCELLATION_REQUESTED("cancellation_requested");

	private final String type;

}
