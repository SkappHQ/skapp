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

	ARIMO("Arimo", FONT_SUFFIX_REGULAR, FONT_SUFFIX_ITALIC, FONT_SUFFIX_BOLD, FONT_SUFFIX_BOLD_ITALIC),
	CARLITO("Carlito", FONT_SUFFIX_REGULAR, FONT_SUFFIX_ITALIC, FONT_SUFFIX_BOLD, FONT_SUFFIX_BOLD_ITALIC),
	TINOS("Tinos", FONT_SUFFIX_REGULAR, FONT_SUFFIX_ITALIC, FONT_SUFFIX_BOLD, FONT_SUFFIX_BOLD_ITALIC),
	DEJAVU_SANS(FONT_FOLDER_DEJAVU_SANS, "", FONT_SUFFIX_OBLIQUE, FONT_SUFFIX_BOLD, FONT_SUFFIX_BOLD_OBLIQUE),
	INTER("Inter", FONT_SUFFIX_REGULAR, FONT_SUFFIX_ITALIC, FONT_SUFFIX_BOLD, FONT_SUFFIX_BOLD_ITALIC),
	POPPINS("Poppins", FONT_SUFFIX_REGULAR, FONT_SUFFIX_ITALIC, FONT_SUFFIX_BOLD, FONT_SUFFIX_BOLD_ITALIC);

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
