package com.skapp.enterprise.esignature.payload.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class FieldContainerDto {

	private String fontFamily;

	private String fontColor;

	private Integer fontSize;

	private Boolean isBold;

	private Boolean isItalic;

	private Boolean isUnderline;

	private Boolean isRequired;

	private Boolean isMultiSelect;

	@NotEmpty(message = "{validation.field-container.fields.not-empty}")
	private List<FieldDto> fields;

}
