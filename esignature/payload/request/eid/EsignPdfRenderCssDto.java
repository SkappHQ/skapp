package com.skapp.enterprise.esignature.payload.request.eid;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EsignPdfRenderCssDto {

	private String adjustedWidth;

	private String adjustedHeight;

	private String fontFamilyCss;

	private String fontSize;

	private String fontWeight;

	private String fontStyle;

	private String textDecoration;

	private String fontColor;

	private String horizontalPadding;

	private String verticalPadding;

	private String lineHeight;

	private String escapedValue;

}
