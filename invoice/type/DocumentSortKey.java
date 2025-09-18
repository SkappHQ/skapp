package com.skapp.enterprise.invoice.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum DocumentSortKey {

	ID("id");

	private final String field;

}
