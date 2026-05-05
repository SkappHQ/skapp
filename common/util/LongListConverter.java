package com.skapp.enterprise.common.util;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Converter
public class LongListConverter implements AttributeConverter<List<Long>, String> {

	private static final String DELIMITER = ",";

	@Override
	public String convertToDatabaseColumn(List<Long> ids) {
		if (ids == null || ids.isEmpty()) {
			return null;
		}
		return ids.stream().filter(Objects::nonNull).map(String::valueOf).collect(Collectors.joining(DELIMITER));
	}

	@Override
	public List<Long> convertToEntityAttribute(String dbData) {
		if (dbData == null || dbData.isBlank()) {
			return Collections.emptyList();
		}
		return Arrays.stream(dbData.split(DELIMITER))
			.map(String::trim)
			.filter(s -> !s.isEmpty() && s.chars().allMatch(Character::isDigit))
			.map(Long::valueOf)
			.collect(Collectors.toCollection(ArrayList::new));
	}

}
