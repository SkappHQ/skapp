package com.skapp.enterprise.esignature.utill.deserializer;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.type.EnvelopeStatus;

import java.io.IOException;

public class EnvelopeStatusDeserializer extends StdDeserializer<EnvelopeStatus> {

	public EnvelopeStatusDeserializer() {
		super(AccountStatus.class);
	}

	@Override
	public EnvelopeStatus deserialize(JsonParser p, DeserializationContext ctxt) throws ModuleException, IOException {
		JsonNode jsonNode = p.readValueAsTree();
		String value = jsonNode.asText().trim();

		if (jsonNode.isNull() || jsonNode.isMissingNode() || value.isEmpty()) {
			return null;
		}

		try {
			return EnvelopeStatus.valueOf(value.toUpperCase());
		}
		catch (IllegalArgumentException e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_VALIDATION_ENVELOPE_STATUS_INVALID,
					new String[] { value });
		}
	}

}
