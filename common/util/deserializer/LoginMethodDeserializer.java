package com.skapp.enterprise.common.util.deserializer;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.type.LoginMethod;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;

import java.io.IOException;

public class LoginMethodDeserializer extends StdDeserializer<LoginMethod> {

	public LoginMethodDeserializer() {
		super(LoginMethod.class);
	}

	@Override
	public LoginMethod deserialize(JsonParser jsonParser, DeserializationContext deserializationContext)
			throws ModuleException, IOException {
		JsonNode jsonNode = jsonParser.readValueAsTree();
		String value = jsonNode.asText().trim();

		if (jsonNode.isNull() || jsonNode.isMissingNode() || value.isEmpty()) {
			return null;
		}

		try {
			return LoginMethod.valueOf(value.toUpperCase());
		}
		catch (IllegalArgumentException e) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_LOGIN_METHOD);
		}
	}

}
