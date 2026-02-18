package com.skapp.enterprise.esignature.payload.request.template;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TemplateFieldContainerDto {

	private String fontFamily;

	private String fontColor;

	private Integer fontSize;

	private Boolean isBold;

	private Boolean isItalic;

	private Boolean isUnderline;

	private Boolean isRequired;

	private Boolean isMultiSelect;

	@NotEmpty(message = "{validation.template-field-container.template-fields.not-empty}")
	private List<AdvanceTemplateFieldDto> templateFields;

}
