package com.skapp.enterprise.esignature.payload.response.template;

import com.skapp.enterprise.esignature.type.SignType;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EnvelopeTemplateDetailedResponseDto {

	private Long id;

	private String name;

	private String subject;

	private String message;

	private SignType signType;

	private List<DocumentTemplateDetailResponseDto> templateDocuments;

	private List<RecipientTemplateDetailResponseDto> templateRecipients;

	private EnvelopeTemplateSettingResponseDto templateEnvelopeSetting;

}
