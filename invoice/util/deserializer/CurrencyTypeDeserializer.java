package com.skapp.enterprise.invoice.util.deserializer;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.invoice.constant.InvoiceMessageConstant;
import com.skapp.enterprise.invoice.type.CurrencyType;

import java.io.IOException;

public class CurrencyTypeDeserializer extends StdDeserializer<CurrencyType> {

	public CurrencyTypeDeserializer() {
		super(CurrencyType.class);
	}

	@Override
	public CurrencyType deserialize(JsonParser p, DeserializationContext ctxt) throws ModuleException, IOException {
		JsonNode jsonNode = p.readValueAsTree();
		String value = jsonNode.asText().trim();

		if (jsonNode.isNull() || jsonNode.isMissingNode() || value.isEmpty()) {
			return null;
		}

		try {
			return CurrencyType.valueOf(value.toUpperCase());
		}
		catch (IllegalArgumentException e) {
			throw new ModuleException(InvoiceMessageConstant.INVOICE_ERROR_VALIDATION_CURRENCY_TYPE_INVALID,
					new String[] { value });
		}
	}

}
