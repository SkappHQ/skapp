package com.skapp.enterprise.esignature.type;

import static com.skapp.enterprise.esignature.constant.EsignConstants.FONT_FOLDER_DEJAVU_SANS;
import static com.skapp.enterprise.esignature.constant.EsignConstants.FONT_FOLDER_NOTO_SANS_JP;
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

	ARIAL("Arial", "Arimo", FONT_SUFFIX_REGULAR, FONT_SUFFIX_ITALIC, FONT_SUFFIX_BOLD, FONT_SUFFIX_BOLD_ITALIC),
	CALIBRI("Calibri", "Carlito", FONT_SUFFIX_REGULAR, FONT_SUFFIX_ITALIC, FONT_SUFFIX_BOLD, FONT_SUFFIX_BOLD_ITALIC),
	COURIER_NEW("Courier New", "Cousine", FONT_SUFFIX_REGULAR, FONT_SUFFIX_ITALIC, FONT_SUFFIX_BOLD,
			FONT_SUFFIX_BOLD_ITALIC),
	TIMES_NEW_ROMAN("Times New Roman", "Tinos", FONT_SUFFIX_REGULAR, FONT_SUFFIX_ITALIC, FONT_SUFFIX_BOLD,
			FONT_SUFFIX_BOLD_ITALIC),
	VERDANA("Verdana", FONT_FOLDER_DEJAVU_SANS, "", FONT_SUFFIX_OBLIQUE, FONT_SUFFIX_BOLD, FONT_SUFFIX_BOLD_OBLIQUE),
	MS_GOTHIC("MS Gothic", FONT_FOLDER_NOTO_SANS_JP, FONT_SUFFIX_REGULAR, FONT_SUFFIX_ITALIC, FONT_SUFFIX_BOLD,
			FONT_SUFFIX_BOLD_ITALIC),
	INTER("INTER", "Inter", FONT_SUFFIX_REGULAR, FONT_SUFFIX_ITALIC, FONT_SUFFIX_BOLD, FONT_SUFFIX_BOLD_ITALIC),
	POPPINS("POPPINS", "Poppins", FONT_SUFFIX_REGULAR, FONT_SUFFIX_ITALIC, FONT_SUFFIX_BOLD, FONT_SUFFIX_BOLD_ITALIC),
	DEJAVU_SANS(FONT_FOLDER_DEJAVU_SANS, FONT_FOLDER_DEJAVU_SANS, "", FONT_SUFFIX_OBLIQUE, FONT_SUFFIX_BOLD,
			FONT_SUFFIX_BOLD_OBLIQUE),
	NOTO_SANS_JP("Noto Sans JP", FONT_FOLDER_NOTO_SANS_JP, FONT_SUFFIX_REGULAR, FONT_SUFFIX_ITALIC, FONT_SUFFIX_BOLD,
			FONT_SUFFIX_BOLD_ITALIC);

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
