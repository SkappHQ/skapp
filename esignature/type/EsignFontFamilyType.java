package com.skapp.enterprise.esignature.type;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum EsignFontFamilyType {

	ARIMO("Arimo", "-Regular", "-Italic", "-Bold", "-BoldItalic"),
	CARLITO("Carlito", "-Regular", "-Italic", "-Bold", "-BoldItalic"),
	TINOS("Tinos", "-Regular", "-Italic", "-Bold", "-BoldItalic"),
	DEJAVU_SANS("DejaVuSans", "", "-Oblique", "-Bold", "-BoldOblique"),
	INTER("Inter", "-Regular", "-Italic", "-Bold", "-BoldItalic"),
	POPPINS("Poppins", "-Regular", "-Italic", "-Bold", "-BoldItalic");

	private final String folderName;

	private final String regularSuffix;

	private final String italicSuffix;

	private final String boldSuffix;

	private final String boldItalicSuffix;

	public String getVariantSuffix(EsignFontVariantType variant) {
		return switch (variant) {
			case REGULAR -> regularSuffix;
			case ITALIC -> italicSuffix;
			case BOLD -> boldSuffix;
			case BOLD_ITALIC -> boldItalicSuffix;
		};
	}

}
