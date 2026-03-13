package com.skapp.enterprise.esignature.type;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum EsignFontFamilyType {

	ARIAL("Arial", "Arimo"), CALIBRI("Calibri", "Carlito"), COURIER_NEW("Courier New", "Cousine"),
	TIMES_NEW_ROMAN("Times New Roman", "Tinos"), VERDANA("Verdana", "DejaVuSans"), MS_GOTHIC("MS Gothic", "NotoSansJP"),
	INTER("INTER", "Inter"), POPPINS("POPPINS", "Poppins"), DEJAVU_SANS("DejaVuSans", "DejaVuSans"),
	NOTO_SANS_JP("Noto Sans JP", "NotoSansJP");

	private final String familyName;

	private final String folderName;

	public static String getFolderByFamily(String family) {
		for (EsignFontFamilyType fontFamily : values()) {
			if (fontFamily.familyName.equals(family)) {
				return fontFamily.folderName;
			}
		}
		return null;
	}

	public static String getFamilyName(String enumName) {
		if (enumName == null) {
			return POPPINS.familyName;
		}
		for (EsignFontFamilyType type : values()) {
			if (type.name().equals(enumName)) {
				return type.familyName;
			}
		}
		return POPPINS.familyName;
	}

}
