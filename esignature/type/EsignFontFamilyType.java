package com.skapp.enterprise.esignature.type;

public enum EsignFontFamilyType {

	ARIAL("ARIAL", "Arimo"), CALIBRI("CALIBRI", "Carlito"), COURIER_NEW("COURIER_NEW", "Cousine"),
	TIMES_NEW_ROMAN("TIMES_NEW_ROMAN", "Tinos"), VERDANA("VERDANA", "DejaVuSans"), MS_GOTHIC("MS_GOTHIC", "NotoSansJP"),
	INTER("INTER", "Inter"), POPPINS("POPPINS", "Poppins");

	private final String familyName;

	private final String folderName;

	EsignFontFamilyType(String familyName, String folderName) {
		this.familyName = familyName;
		this.folderName = folderName;
	}

	public static String getFolderByFamily(String family) {
		for (EsignFontFamilyType ff : values()) {
			if (ff.familyName.equals(family)) {
				return ff.folderName;
			}
		}
		return null;
	}

}
