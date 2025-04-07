package com.skapp.enterprise.esignature.utill;

import java.util.UUID;

public class EsignUtil {

	private static final String FILE_PREFIX = "processed_";

	private EsignUtil() {
	}

	public static String generateFileUrl() {
		return FILE_PREFIX + UUID.randomUUID() + ".pdf";
	}

}
