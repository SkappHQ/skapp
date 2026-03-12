package com.skapp.enterprise.esignature.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FieldSignContainerDto {

	private String fontFamily;

	private String fontColor;

	private Integer fontSize;

	private Boolean isBold;

	private Boolean isItalic;

	private Boolean isUnderline;

	private float horizontalPadding;

	private float verticalPadding;

	private float textLineHeight;

}
