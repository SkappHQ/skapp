package com.skapp.enterprise.esignature.type;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum EsignFontFamilyType {

	ARIMO("Arimo", "Arimo", "-Regular", "-Italic", "-Bold", "-BoldItalic"),
	CARLITO("Carlito", "Carlito", "-Regular", "-Italic", "-Bold", "-BoldItalic"),
	TINOS("Tinos", "Tinos", "-Regular", "-Italic", "-Bold", "-BoldItalic"),
	NOTO_SANS("NotoSans", "Noto Sans", "-Regular", "-Italic", "-Bold", "-BoldItalic"),
	INTER("Inter", "Inter", "-Regular", "-Italic", "-Bold", "-BoldItalic"),
	POPPINS("Poppins", "Poppins", "-Regular", "-Italic", "-Bold", "-BoldItalic");

	private final String folderName;

	private final String cssName;

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

	// Resolver since Multi-word names need to be wrap in quotes
	public String getCssFontFamily() {
		return cssName.contains(" ") ? "'" + cssName + "'" : cssName;
	}

}
