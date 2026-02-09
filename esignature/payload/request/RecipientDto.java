package com.skapp.enterprise.esignature.payload.request;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.skapp.enterprise.esignature.type.EidProviderType;
import com.skapp.enterprise.esignature.type.EsignVerificationType;
import com.skapp.enterprise.esignature.type.MemberRole;
import com.skapp.enterprise.esignature.type.RecipientStatus;
import com.skapp.enterprise.esignature.util.deserializer.RecipientMemberRoleDeserializer;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RecipientDto {

	@NotNull(message = "{validation.recipient.addressBookId.notnull}")
	private Long addressBookId;

	@NotNull(message = "{validation.recipient.memberRole.notnull}")
	@JsonDeserialize(using = RecipientMemberRoleDeserializer.class)
	private MemberRole memberRole;

	@NotNull(message = "{validation.recipient.status.notnull}")
	private RecipientStatus status;

	@NotNull(message = "{validation.recipient.signingOrder.notnull}")
	@Min(value = 1, message = "{validation.recipient.signingOrder.min}")
	private Integer signingOrder;

	@NotNull(message = "{validation.recipient.color.notnull}")
	private String color;

	@NotEmpty(message = "{validation.recipient.fields.not-empty}")
	private List<FieldDto> fields;

	private EsignVerificationType verificationType = EsignVerificationType.NONE;

	/**
	 * eID verification method for this recipient. When set to a value other than NONE,
	 * the recipient must complete eID verification (e.g., BankID) before signing.
	 */
	private EidProviderType eidVerificationMethod = EidProviderType.NONE;

}
