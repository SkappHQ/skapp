package com.skapp.community.peopleplanner.util.deserializer;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.type.EEO;
import tools.jackson.core.JsonParser;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.deser.std.StdDeserializer;

public class EeoDeserializer extends StdDeserializer<EEO> {

	public EeoDeserializer() {
		super(EEO.class);
	}

	@Override
	public EEO deserialize(JsonParser p, DeserializationContext ctxt) throws ModuleException {
		JsonNode jsonNode = p.readValueAsTree();
		String value = jsonNode.asString().trim();

		if (jsonNode.isNull() || jsonNode.isMissingNode() || value.isEmpty()) {
			return null;
		}

		try {
			return EEO.valueOf(value.toUpperCase());
		}
		catch (IllegalArgumentException e) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_INVALID_VALUE_FOR_EEO_ENUM,
					new String[] { value });
		}
	}

}
