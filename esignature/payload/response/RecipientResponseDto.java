package com.skapp.enterprise.esignature.payload.response;

import com.skapp.enterprise.esignature.type.EidProviderType;
import com.skapp.enterprise.esignature.type.EidVerificationStatus;
import com.skapp.enterprise.esignature.type.EsignVerificationType;
import com.skapp.enterprise.esignature.type.MemberRole;
import com.skapp.enterprise.esignature.type.RecipientStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RecipientResponseDto {

	private Long id;

	private MemberRole memberRole;

	private RecipientStatus status;

	private int signingOrder;

	private String color;

	private boolean isConsent;

	private AddressBookBasicResponseDto addressBook;

	private boolean isMfaVerificationEnabled;

	private EsignVerificationType mfaVerificationMethod;

	private EidProviderType eidVerificationMethod;

	private EidVerificationStatus eidVerificationStatus;

}
