package com.skapp.enterprise.esignature.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum DateFormatType {

	DD_MM_YYYY("DD/MM/YYYY"), YYYY_MM_DD("YYYY/MM/DD"), MM_DD_YYYY("MM/DD/YYYY");

	private final String value;

}
