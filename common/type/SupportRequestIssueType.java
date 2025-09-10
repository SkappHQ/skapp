package com.skapp.enterprise.common.type;

import lombok.Getter;

@Getter
public enum SupportRequestIssueType {

	SUBSCRIPTION_OR_BILLING("Subscription or billing"), UNEXPECTED_BEHAVIOUR("Unexpected behaviour"),
	NEW_FEATURE_REQUEST("New feature request"), OTHER("Other");

	public final String label;

	SupportRequestIssueType(String label) {
		this.label = label;
	}

}
