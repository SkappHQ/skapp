package com.skapp.community.common.util.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Slf4j
@Converter
public class JsonTypeConverter implements AttributeConverter<JsonNode, String> {

	@Override
	public String convertToDatabaseColumn(JsonNode jsonNode) {
		if (jsonNode == null || jsonNode.isNull()) {
			return null;
		}
		else {
			return jsonNode.toPrettyString();
		}
	}

	@Override
	public JsonNode convertToEntityAttribute(String s) {
		if (s == null || s.isEmpty()) {
			return null;
		}
		else {
			ObjectMapper mapper = new ObjectMapper();
			return mapper.readTree(s);
		}
	}

}
