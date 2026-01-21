package com.skapp.enterprise.esignature.mapper;

import com.fasterxml.jackson.databind.JsonNode;
import com.skapp.enterprise.esignature.model.EidVerificationSession;
import com.skapp.enterprise.esignature.model.VerifiedIdentity;
import com.skapp.enterprise.esignature.payload.response.eid.VerificationInitiationResponseDto;
import com.skapp.enterprise.esignature.payload.response.eid.VerificationStatusResponseDto;
import com.skapp.enterprise.esignature.payload.response.eid.VerifiedIdentityDto;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

/**
 * MapStruct mapper for eID verification entities and DTOs.
 */
@Mapper(componentModel = "spring")
public interface EidMapper {

	@Mapping(source = "sessionUuid", target = "sessionId")
	@Mapping(source = "recipient.id", target = "recipientId")
	@Mapping(source = "document.id", target = "documentId")
	@Mapping(source = "providerData", target = "autoStartToken", qualifiedByName = "extractAutoStartToken")
	@Mapping(source = "providerData", target = "qrStartToken", qualifiedByName = "extractQrStartToken")
	@Mapping(source = "providerData", target = "qrStartSecret", qualifiedByName = "extractQrStartSecret")
	VerificationInitiationResponseDto sessionToVerificationInitiationResponse(EidVerificationSession session);

	@Mapping(source = "sessionUuid", target = "sessionId")
	@Mapping(source = "providerData", target = "hintCode", qualifiedByName = "extractHintCode")
	@Mapping(source = "verifiedIdentity", target = "verifiedIdentity")
	VerificationStatusResponseDto sessionToVerificationStatusResponse(EidVerificationSession session);

	VerifiedIdentityDto verifiedIdentityToDto(VerifiedIdentity identity);

	@Named("extractAutoStartToken")
	default String extractAutoStartToken(JsonNode providerData) {
		return extractJsonField(providerData, "autoStartToken");
	}

	@Named("extractQrStartToken")
	default String extractQrStartToken(JsonNode providerData) {
		return extractJsonField(providerData, "qrStartToken");
	}

	@Named("extractQrStartSecret")
	default String extractQrStartSecret(JsonNode providerData) {
		return extractJsonField(providerData, "qrStartSecret");
	}

	@Named("extractHintCode")
	default String extractHintCode(JsonNode providerData) {
		return extractJsonField(providerData, "hintCode");
	}

	default String extractJsonField(JsonNode node, String fieldName) {
		if (node == null || !node.has(fieldName)) {
			return null;
		}
		return node.get(fieldName).asText();
	}

}
