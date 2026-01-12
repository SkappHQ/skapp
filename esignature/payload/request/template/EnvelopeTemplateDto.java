package com.skapp.enterprise.esignature.payload.request.template;

import com.skapp.enterprise.esignature.type.SignType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EnvelopeTemplateDto {

	@NotBlank(message = "{validation.template.envelope.name.not_blank}")
	private String name;

	@NotBlank(message = "{validation.template.envelope.subject.not_blank}")
	private String subject;

	private String message;

	@NotNull(message = "{validation.template.envelope.signType.notnull}")
	private SignType signType;

	@NotEmpty(message = "{validation.template.envelope.templateDocumentIds.not_empty}")
	private List<Long> templateDocumentIds;

	@NotEmpty(message = "{validation.template.envelope.templateRecipients.not_empty}")
	private List<RecipientTemplateDto> templateRecipients;

	private EnvelopeTemplateSettingDto templateEnvelopeSettingDto;

}
