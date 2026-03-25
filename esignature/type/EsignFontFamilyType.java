package com.skapp.enterprise.esignature.type;

import static com.skapp.enterprise.esignature.constant.EsignConstants.FONT_FOLDER_DEJAVU_SANS;
import static com.skapp.enterprise.esignature.constant.EsignConstants.FONT_SUFFIX_BOLD;
import static com.skapp.enterprise.esignature.constant.EsignConstants.FONT_SUFFIX_BOLD_ITALIC;
import static com.skapp.enterprise.esignature.constant.EsignConstants.FONT_SUFFIX_BOLD_OBLIQUE;
import static com.skapp.enterprise.esignature.constant.EsignConstants.FONT_SUFFIX_ITALIC;
import static com.skapp.enterprise.esignature.constant.EsignConstants.FONT_SUFFIX_OBLIQUE;
import static com.skapp.enterprise.esignature.constant.EsignConstants.FONT_SUFFIX_REGULAR;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum EsignFontFamilyType {

	ARIMO("Arial", "Arimo", FONT_SUFFIX_REGULAR, FONT_SUFFIX_ITALIC, FONT_SUFFIX_BOLD, FONT_SUFFIX_BOLD_ITALIC),
	CARLITO("Calibri", "Carlito", FONT_SUFFIX_REGULAR, FONT_SUFFIX_ITALIC, FONT_SUFFIX_BOLD, FONT_SUFFIX_BOLD_ITALIC),
	TINOS("Times New Roman", "Tinos", FONT_SUFFIX_REGULAR, FONT_SUFFIX_ITALIC, FONT_SUFFIX_BOLD,
			FONT_SUFFIX_BOLD_ITALIC),
	DEJAVU_SANS("Verdana", FONT_FOLDER_DEJAVU_SANS, "", FONT_SUFFIX_OBLIQUE, FONT_SUFFIX_BOLD,
			FONT_SUFFIX_BOLD_OBLIQUE),
	INTER("INTER", "Inter", FONT_SUFFIX_REGULAR, FONT_SUFFIX_ITALIC, FONT_SUFFIX_BOLD, FONT_SUFFIX_BOLD_ITALIC),
	POPPINS("POPPINS", "Poppins", FONT_SUFFIX_REGULAR, FONT_SUFFIX_ITALIC, FONT_SUFFIX_BOLD, FONT_SUFFIX_BOLD_ITALIC);

	private final String familyName;

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

	public static EsignFontFamilyType getByFamilyName(String family) {
		for (EsignFontFamilyType fontFamily : values()) {
			if (fontFamily.familyName.equals(family)) {
				return fontFamily;
			}
		}
		return INTER;
	}

	public static String getFamilyName(String enumName) {

		for (EsignFontFamilyType fontFamily : values()) {
			if (fontFamily.name().equals(enumName)) {
				return fontFamily.familyName;
			}
		}
		return INTER.familyName;
	}

}
