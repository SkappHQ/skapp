package com.skapp.enterprise.common.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SubscriptionStatus {

	FREE_TRIAL("trialing"), // 1st 14 days
	ACTIVE("active"), // after 14-day successful payment
	PENDING("pending"), // after 14-days when payment fails during retry
	CANCELED("canceled"), // user cancels subscription
	PAST_DUE("past_due"), // payment fails after retry
	UNPAID("unpaid"); // payment fails after retry

	private final String status;

}
