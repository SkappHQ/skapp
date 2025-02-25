package com.skapp.enterprise.common.type;

public enum SubscriptionStatus {

	FREE_TRIAL, // 1st 14 days
	ACTIVE, // after 14-day successful payment
	PENDING, // after 14-days when payment fails during retry
	CANCELLED, // user cancels subscription
	PAST_DUE, // payment fails after retry

}
