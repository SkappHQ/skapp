package com.skapp.enterprise.esignature.payload.response.template;

import com.skapp.enterprise.esignature.payload.response.AddressBookBasicResponseDto;
import com.skapp.enterprise.esignature.type.EsignVerificationType;
import com.skapp.enterprise.esignature.type.MemberRole;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RecipientTemplateDetailResponseDto {

	private Long id;

	private String recipientRole;

	private MemberRole memberRole;

	private Integer signingOrder;

	private String color;

	private List<FieldTemplateDetailResponseDto> templateFields;

	private List<TemplateFieldContainerResponseDto> advanceTemplateFieldContainers;

	private AddressBookBasicResponseDto addressBook;

	private Boolean mfaVerificationEnabled;

	private EsignVerificationType mfaVerificationMethod;

}
