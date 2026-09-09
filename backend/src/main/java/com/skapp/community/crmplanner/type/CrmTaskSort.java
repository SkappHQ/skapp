package com.skapp.community.crmplanner.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CrmTaskSort {

	DUE_AT("dueAt"), LAST_MODIFIED_DATE("lastModifiedDate");

	private final String sortField;

}
