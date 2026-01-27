package com.skapp.enterprise.esignature.payload.request.eid;

import com.skapp.enterprise.esignature.type.EidProviderType;
import jakarta.validation.constraints.NotBlank;
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

	/**
	 * Text to display to the user in the eID app. For BankID, this is shown as the
	 * signing message.
	 */
	@NotBlank(message = "User visible data is required")
	private String userVisibleData;

	/**
	 * SHA-256 hash of the document being signed (hex encoded).
	 */
	@NotBlank(message = "Document hash is required")
	private String documentHash;

}
