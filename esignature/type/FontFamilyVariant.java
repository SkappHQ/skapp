package com.skapp.enterprise.esignature.type;

public enum FontFamilyVariant {

	DEJAVU_SANS_BOLD_ITALIC("DejaVuSans", FontVariantType.BOLD_ITALIC, "DejaVuSans-BoldOblique.ttf"),
	DEJAVU_SANS_BOLD("DejaVuSans", FontVariantType.BOLD, "DejaVuSans-Bold.ttf"),
	DEJAVU_SANS_ITALIC("DejaVuSans", FontVariantType.ITALIC, "DejaVuSans-Oblique.ttf"),
	DEJAVU_SANS_REGULAR("DejaVuSans", FontVariantType.REGULAR, "DejaVuSans.ttf");

	private final String fontFamily;

	private final FontVariantType variantType;

	private final String filename;

	FontFamilyVariant(String fontFamily, FontVariantType variantType, String filename) {
		this.fontFamily = fontFamily;
		this.variantType = variantType;
		this.filename = filename;
	}

	public String getFilename() {
		return filename;
	}

	public static String getFilenameFor(String fontFamily, FontVariantType variantType) {
		for (FontFamilyVariant v : values()) {
			if (v.fontFamily.equalsIgnoreCase(fontFamily) && v.variantType == variantType) {
				return v.filename;
			}
		}
		return null;
	}

}
