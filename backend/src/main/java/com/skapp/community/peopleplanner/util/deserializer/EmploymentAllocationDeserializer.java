package com.skapp.community.peopleplanner.util.deserializer;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.type.EmploymentAllocation;
import tools.jackson.core.JsonParser;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.deser.std.StdDeserializer;

public class EmploymentAllocationDeserializer extends StdDeserializer<EmploymentAllocation> {

	public EmploymentAllocationDeserializer() {
		super(EmploymentAllocation.class);
	}

	@Override
	public EmploymentAllocation deserialize(JsonParser p, DeserializationContext ctxt) throws ModuleException {
		JsonNode jsonNode = p.readValueAsTree();
		String value = jsonNode.toString().trim();

		if (jsonNode.isNull() || jsonNode.isMissingNode() || value.isEmpty()) {
			return null;
		}

		try {
			return EmploymentAllocation.valueOf(value.toUpperCase());
		}
		catch (IllegalArgumentException e) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_INVALID_VALUE_FOR_EMPLOYMENT_ALLOCATION_ENUM,
					new String[] { value });
		}
	}

}
