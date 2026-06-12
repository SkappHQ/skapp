package com.skapp.community.common.config;

import org.springframework.boot.jackson.autoconfigure.JsonMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.core.JacksonException;
import tools.jackson.core.JsonParser;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.ValueDeserializer;
import tools.jackson.databind.module.SimpleModule;

@Configuration
public class JacksonConfig {

	@Bean
	public JsonMapperBuilderCustomizer trimmingCustomizer() {
		return builder -> {
			SimpleModule module = new SimpleModule("StringTrimmingModule");
			module.addDeserializer(String.class, new StringTrimmingDeserializer());
			builder.addModule(module);
		};
	}

	private static class StringTrimmingDeserializer extends ValueDeserializer<String> {

		@Override
		public String deserialize(JsonParser jsonParser, DeserializationContext deserializationContext)
				throws JacksonException {
			String value = jsonParser.getValueAsString();
			return value != null ? value.trim() : null;
		}

	}

}
