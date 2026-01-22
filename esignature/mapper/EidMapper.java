package com.skapp.enterprise.esignature.mapper;

import com.fasterxml.jackson.databind.JsonNode;
import com.skapp.enterprise.esignature.model.EidVerificationSession;
import com.skapp.enterprise.esignature.model.VerifiedIdentity;
import com.skapp.enterprise.esignature.payload.response.eid.VerificationInitiationResponseDto;
import com.skapp.enterprise.esignature.payload.response.eid.VerificationStatusResponseDto;
import com.skapp.enterprise.esignature.payload.response.eid.VerifiedIdentityDto;
import com.skapp.enterprise.esignature.util.BankIdQrCodeUtil;

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
	@Mapping(target = "qrCode", expression = "java(computeQrCode(session))")
	VerificationInitiationResponseDto sessionToVerificationInitiationResponse(EidVerificationSession session);

	@Mapping(source = "sessionUuid", target = "sessionId")
	@Mapping(source = "providerData", target = "hintCode", qualifiedByName = "extractHintCode")
	@Mapping(source = "verifiedIdentity", target = "verifiedIdentity")
	@Mapping(target = "qrCode", expression = "java(computeQrCodeForStatus(session))")
	VerificationStatusResponseDto sessionToVerificationStatusResponse(EidVerificationSession session);

	VerifiedIdentityDto verifiedIdentityToDto(VerifiedIdentity identity);

	@Named("extractAutoStartToken")
	default String extractAutoStartToken(JsonNode providerData) {
		return extractJsonField(providerData, "autoStartToken");
	}

	@Named("extractHintCode")
	default String extractHintCode(JsonNode providerData) {
		return extractJsonField(providerData, "hintCode");
	}

	/**
	 * Computes the BankID QR code for initiation response.
	 */
	@Named("computeQrCode")
	default String computeQrCode(EidVerificationSession session) {
		if (session == null || session.getProviderData() == null) {
			return null;
		}
		return BankIdQrCodeUtil.computeQrCode(session.getProviderData(), session.getInitiatedAt());
	}

	/**
	 * Computes the BankID QR code for status response. Only returns QR code if session is
	 * still active (PENDING or USER_ACTION_REQUIRED).
	 */
	@Named("computeQrCodeForStatus")
	default String computeQrCodeForStatus(EidVerificationSession session) {
		if (session == null || session.getProviderData() == null) {
			return null;
		}
		// Only return QR code for active sessions
		var status = session.getStatus();
		if (status == null) {
			return null;
		}
		switch (status) {
			case PENDING:
			case USER_ACTION_REQUIRED:
				return BankIdQrCodeUtil.computeQrCode(session.getProviderData(), session.getInitiatedAt());
			default:
				return null;
		}
	}

	default String extractJsonField(JsonNode node, String fieldName) {
		if (node == null || !node.has(fieldName)) {
			return null;
		}
		return node.get(fieldName).asText();
	}

}
