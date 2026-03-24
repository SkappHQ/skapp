package com.skapp.enterprise.esignature.type;

import com.openhtmltopdf.outputdevice.helper.BaseRendererBuilder;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum EsignFontVariantType {

	REGULAR(400, BaseRendererBuilder.FontStyle.NORMAL), ITALIC(400, BaseRendererBuilder.FontStyle.ITALIC),
	BOLD(700, BaseRendererBuilder.FontStyle.NORMAL), BOLD_ITALIC(700, BaseRendererBuilder.FontStyle.ITALIC);

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
