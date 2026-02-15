package com.skapp.enterprise.esignature.payload.request.template;

import com.skapp.enterprise.esignature.type.EsignVerificationType;
import com.skapp.enterprise.esignature.type.MemberRole;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TemplateRecipientDto {

	@NotEmpty(message = "{validation.template.recipient.recipientRole.not_empty}")
	private String recipientRole;

	@NotNull(message = "{validation.template.recipient.memberRole.notnull}")
	private MemberRole memberRole;

	@NotNull(message = "{validation.template.recipient.signingOrder.notnull}")
	@Min(value = 1, message = "{validation.template.recipient.signingOrder.min}")
	private Integer signingOrder;

	@NotEmpty(message = "{validation.template.recipient.color.not_empty}")
	private String color;

	private Long addressBookId;

	@NotNull(message = "{validation.template.recipient.verificationType.notnull}")
	private EsignVerificationType verificationType = EsignVerificationType.NONE;

	private List<TemplateFieldDto> templateFields;

	private List<TemplateFieldContainerDto> advanceTemplateFieldContainers;

}
