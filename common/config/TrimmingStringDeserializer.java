package com.skapp.enterprise.common.config;

import tools.jackson.core.JacksonException;
import tools.jackson.core.JsonParser;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.ValueDeserializer;

public class TrimmingStringDeserializer extends ValueDeserializer<String> {

	@Override
	public String deserialize(JsonParser jsonParser, DeserializationContext deserializationContext)
			throws JacksonException {
		String value = jsonParser.getValueAsString();
		return value != null ? value.trim() : null;
	}

}
