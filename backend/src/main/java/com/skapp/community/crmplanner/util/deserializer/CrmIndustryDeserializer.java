package com.skapp.community.crmplanner.util.deserializer;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.type.CrmIndustry;
import tools.jackson.core.JsonParser;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.deser.std.StdDeserializer;

public class CrmIndustryDeserializer extends StdDeserializer<CrmIndustry> {

	public CrmIndustryDeserializer() {
		super(CrmIndustry.class);
	}

	@Override
	public CrmIndustry deserialize(JsonParser p, DeserializationContext ctxt) throws ModuleException {
		JsonNode jsonNode = p.readValueAsTree();
		String value = jsonNode.asString().trim();

		if (jsonNode.isNull() || jsonNode.isMissingNode() || value.isEmpty()) {
			return null;
		}

		try {
			return CrmIndustry.valueOf(value.toUpperCase());
		}
		catch (IllegalArgumentException e) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_INDUSTRY_INVALID, new String[] { value });
		}
	}

}
