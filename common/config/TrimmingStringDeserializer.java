// package com.skapp.enterprise.common.config;
//
//
// import tools.jackson.core.JsonParser;
// import tools.jackson.databind.DeserializationContext;
//
// import java.io.IOException;
//
// public class TrimmingStringDeserializer extends JsonDeserializer<String> {
//
// @Override
// public String deserialize(JsonParser jsonParser, DeserializationContext
// deserializationContext) throws IOException {
// String value = jsonParser.getValueAsString();
// return value != null ? value.trim() : null;
// }
//
// }
