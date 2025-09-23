package com.skapp.enterprise.invoice.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum BillableFrequency {

	PER_HOUR("Per Hour"), PER_DAY("Per Day"), PER_WEEK("Per Week"), PER_MONTH("Per Month");

	private final String value;

}
