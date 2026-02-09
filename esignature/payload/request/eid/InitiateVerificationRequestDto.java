package com.skapp.enterprise.esignature.payload.request.eid;

import com.skapp.enterprise.esignature.type.EidProviderType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * Request DTO for initiating eID verification.
 */
@Getter
@Setter
public class InitiateVerificationRequestDto {

	@NotNull(message = "Recipient ID is required")
	private Long recipientId;

	@NotNull(message = "Document ID is required")
	private Long documentId;

	@NotNull(message = "Provider type is required")
	private EidProviderType providerType;

}
