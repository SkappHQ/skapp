package com.skapp.enterprise.esignature.type;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum FontFamilyVariant {

	DEJAVU_SANS_BOLD_ITALIC("DejaVuSans", FontVariantType.BOLD_ITALIC, "DejaVuSans-BoldOblique.ttf"),
	DEJAVU_SANS_BOLD("DejaVuSans", FontVariantType.BOLD, "DejaVuSans-Bold.ttf"),
	DEJAVU_SANS_ITALIC("DejaVuSans", FontVariantType.ITALIC, "DejaVuSans-Oblique.ttf"),
	DEJAVU_SANS_REGULAR("DejaVuSans", FontVariantType.REGULAR, "DejaVuSans.ttf");

	private final String fontFamily;

	private final FontVariantType variantType;

	private final String filename;

	public static String getFilenameFor(String fontFamily, FontVariantType variantType) {
		for (FontFamilyVariant fontFamilyVariant : values()) {
			if (fontFamilyVariant.fontFamily.equalsIgnoreCase(fontFamily)
					&& fontFamilyVariant.variantType == variantType) {
				return fontFamilyVariant.filename;
			}
		}
		return null;
	}

}
