package com.skapp.enterprise.esignature.payload.response;

import com.skapp.enterprise.esignature.type.EidProviderType;
import com.skapp.enterprise.esignature.type.EidVerificationStatus;
import com.skapp.enterprise.esignature.type.EmailReminderStatus;
import com.skapp.enterprise.esignature.type.EmailStatus;
import com.skapp.enterprise.esignature.type.EsignVerificationType;
import com.skapp.enterprise.esignature.type.MemberRole;
import com.skapp.enterprise.esignature.type.RecipientStatus;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RecipientDetailResponseDto {

	private Long id;

	private String name;

	private AddressBookBasicResponseDto addressBook;

	private String email;

	private MemberRole memberRole;

	private RecipientStatus status;

	private int signingOrder;

	private String color;

	private List<FieldDetailResponseDto> fields;

	private List<FieldContainerResponseDto> advanceFieldContainers;

	private Long addressBookId;

	private String reminderBatchId;

	private EmailReminderStatus reminderStatus;

	private EmailStatus emailStatus;

	private boolean isMfaVerificationEnabled;

	private EsignVerificationType mfaVerificationMethod;

	private EidProviderType eidVerificationMethod;

	private EidVerificationStatus eidVerificationStatus;

}
