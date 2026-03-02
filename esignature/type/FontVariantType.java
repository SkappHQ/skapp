package com.skapp.enterprise.esignature.type;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum FontVariantType {

	BOLD_ITALIC("BoldItalic"), BOLD("Bold"), ITALIC("Italic"), REGULAR("Regular");

	private final String variantName;

	public static FontVariantType fromFlags(boolean isBold, boolean isItalic) {
		if (isBold && isItalic)
			return BOLD_ITALIC;
		if (isBold)
			return BOLD;
		if (isItalic)
			return ITALIC;
		return REGULAR;
	}

	public static FontVariantType fromString(String variant) {
		for (FontVariantType v : values()) {
			if (v.variantName.equalsIgnoreCase(variant)) {
				return v;
			}
		}
		return REGULAR;
	}

}
