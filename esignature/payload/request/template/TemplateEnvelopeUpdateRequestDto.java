package com.skapp.enterprise.esignature.payload.request.template;

import com.skapp.enterprise.esignature.type.SignType;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TemplateEnvelopeUpdateRequestDto {

	private String name;

	private String subject;

	private String message;

	private SignType signType;

	private List<Long> templateDocumentIds;

	private List<TemplateRecipientDto> templateRecipients;

	private TemplateEnvelopeSettingDto templateEnvelopeSettingDto;

}
