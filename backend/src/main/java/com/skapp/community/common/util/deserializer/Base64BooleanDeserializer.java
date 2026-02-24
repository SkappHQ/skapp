// package com.skapp.community.common.util.deserializer;
//
// import tools.jackson.core.JsonParser;
// import tools.jackson.databind.DeserializationContext;
// import tools.jackson.databind.JsonDeserializer;
//
// import java.io.IOException;
// import java.util.Base64;
//
// public class Base64BooleanDeserializer extends JsonDeserializer<Boolean> {
//
// @Override
// public Boolean deserialize(JsonParser jsonParser, DeserializationContext context)
// throws IOException {
// String base64Value = jsonParser.getString();
//
// if (base64Value.startsWith("base64:type16:")) {
// base64Value = base64Value.substring("base64:type16:".length());
// }
//
// byte[] decodedBytes = Base64.getDecoder().decode(base64Value);
//
// return decodedBytes[0] == 1;
// }
//
// }
