package com.skapp.enterprise.common.util;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Converter
public class LongListConverter implements AttributeConverter<List<Long>, String> {

	private static final String DELIMITER = ",";

	@Override
	public String convertToDatabaseColumn(List<Long> ids) {
		if (ids == null || ids.isEmpty()) {
			return null;
		}
		return ids.stream().map(String::valueOf).collect(Collectors.joining(DELIMITER));
	}

	@Override
	public List<Long> convertToEntityAttribute(String dbData) {
		if (dbData == null || dbData.isBlank()) {
			return Collections.emptyList();
		}
		return Arrays.stream(dbData.split(DELIMITER)).map(String::trim).map(Long::valueOf).toList();
	}

}
