package com.skapp.community.common.util;

import com.skapp.community.common.type.VersionType;
import lombok.experimental.UtilityClass;

@UtilityClass
public class VersionUtil {

	public static String incrementVersion(String currentVersion, VersionType versionType) {
		if (currentVersion == null || !currentVersion.matches("\\d+\\.\\d+\\.\\d+")) {
			return "1.0.0";
		}

		String[] parts = currentVersion.split("\\.");
		int major = Integer.parseInt(parts[0]);
		int minor = Integer.parseInt(parts[1]);
		int patch = Integer.parseInt(parts[2]);

		switch (versionType) {
			case MAJOR:
				major++;
				minor = 0;
				patch = 0;
				break;
			case MINOR:
				minor++;
				patch = 0;
				break;
			case PATCH:
				patch++;
				break;
		}

		return String.format("%d.%d.%d", major, minor, patch);
	}

}
