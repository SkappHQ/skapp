package com.skapp.enterprise.esignature.payload.request.eid;

import com.skapp.enterprise.esignature.type.EidProviderType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * Request DTO for initiating an eID identification order (auth flow, no document hash).
 */
@Getter
@Setter
public class InitiateIdentificationRequestDto {

	@NotNull(message = "Recipient ID is required")
	private Long recipientId;

	@NotNull(message = "Provider type is required")
	private EidProviderType providerType;

	/**
	 * Optional document this identification is being performed for. When provided, the
	 * session is tied to the document for authorization checks during status polling.
	 */
	private Long documentId;

	/**
	 * Optional text displayed to the user in the eID app during identification.
	 */
	private String userVisibleData;

}
