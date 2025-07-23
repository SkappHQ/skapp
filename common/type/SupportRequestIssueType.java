package com.skapp.enterprise.common.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum SupportRequestIssueType {

	SUBSCRIPTION_OR_BILLING, UNEXPECTED_BEHAVIOUR, NEW_FEATURE_REQUEST, OTHER

}
