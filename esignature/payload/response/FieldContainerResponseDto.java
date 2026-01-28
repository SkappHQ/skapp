package com.skapp.enterprise.esignature.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FieldContainerResponseDto {

	private String fontFamily;

	private String fontColor;

	private Integer fontSize;

	private Boolean isBold;

	private Boolean isItalic;

	private Boolean isUnderline;

	private Boolean isRequired;

	private Boolean isMultiSelect;

}
