package com.skapp.enterprise.esignature.mapper;

import com.skapp.enterprise.esignature.model.EidVerificationSession;
import com.skapp.enterprise.esignature.model.VerifiedIdentity;
import com.skapp.enterprise.esignature.payload.response.eid.VerificationInitiationResponseDto;
import com.skapp.enterprise.esignature.payload.response.eid.VerificationStatusResponseDto;
import com.skapp.enterprise.esignature.payload.response.eid.VerifiedIdentityDto;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper for eID verification entities and DTOs.
 */
@Mapper(componentModel = "spring")
public interface EidMapper {

	@Mapping(source = "sessionUuid", target = "sessionId")
	@Mapping(source = "recipient.id", target = "recipientId")
	@Mapping(source = "document.id", target = "documentId")
	@Mapping(target = "autoStartToken", ignore = true)
	@Mapping(target = "qrCode", ignore = true)
	VerificationInitiationResponseDto sessionToVerificationInitiationResponse(EidVerificationSession session);

	@Mapping(source = "sessionUuid", target = "sessionId")
	@Mapping(source = "verifiedIdentity", target = "verifiedIdentity")
	@Mapping(target = "hintCode", ignore = true)
	@Mapping(target = "qrCode", ignore = true)
	VerificationStatusResponseDto sessionToVerificationStatusResponse(EidVerificationSession session);

	VerifiedIdentityDto verifiedIdentityToDto(VerifiedIdentity identity);

}
