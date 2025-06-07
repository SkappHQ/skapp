package com.skapp.enterprise.esignature.util.deserializer;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.type.MemberRole;

import java.io.IOException;

public class RecipientMemberRoleDeserializer extends StdDeserializer<MemberRole> {

	public RecipientMemberRoleDeserializer() {
		super(AccountStatus.class);
	}

	@Override
	public MemberRole deserialize(JsonParser p, DeserializationContext ctxt) throws ModuleException, IOException {
		JsonNode jsonNode = p.readValueAsTree();
		String value = jsonNode.asText().trim();

		if (jsonNode.isNull() || jsonNode.isMissingNode() || value.isEmpty()) {
			return null;
		}

		try {
			return MemberRole.valueOf(value.toUpperCase());
		}
		catch (IllegalArgumentException e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_VALIDATION_RECIPIENT_MEMBER_ROLE_STATUS_INVALID,
					new String[] { value });
		}
	}

}
