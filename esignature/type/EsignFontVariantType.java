package com.skapp.enterprise.esignature.type;

import com.openhtmltopdf.outputdevice.helper.BaseRendererBuilder;
import lombok.AllArgsConstructor;
import lombok.Getter;

import static com.skapp.enterprise.esignature.constant.EsignConstants.NORMAL_FONT_WEIGHT;
import static com.skapp.enterprise.esignature.constant.EsignConstants.BOLD_FONT_WEIGHT;

@Getter
@AllArgsConstructor
public enum EsignFontVariantType {

	REGULAR(NORMAL_FONT_WEIGHT, BaseRendererBuilder.FontStyle.NORMAL),
	ITALIC(NORMAL_FONT_WEIGHT, BaseRendererBuilder.FontStyle.ITALIC),
	BOLD(BOLD_FONT_WEIGHT, BaseRendererBuilder.FontStyle.NORMAL),
	BOLD_ITALIC(BOLD_FONT_WEIGHT, BaseRendererBuilder.FontStyle.ITALIC);

	private final int fontWeight;

	private final BaseRendererBuilder.FontStyle fontStyle;

	public static EsignFontVariantType fromStyle(boolean isBold, boolean isItalic) {
		if (isBold && isItalic) {
			return BOLD_ITALIC;
		}
		else if (isBold) {
			return BOLD;
		}
		else if (isItalic) {
			return ITALIC;
		}
		return REGULAR;
	}

}
