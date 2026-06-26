package com.skapp.community.common.util;

import com.skapp.community.common.constant.FileConfigConstants;
import lombok.experimental.UtilityClass;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@UtilityClass
public class FileUtil {

	public static Path getParentDirectory() {
		return Paths.get("../../").toAbsolutePath().getParent();
	}

	public static Path getStorageDirectory(String baseFolder, Path parentDir) {
		return parentDir.resolve(baseFolder);
	}

	public static Path getTargetDirectory(String type, List<String> storageFolders, String baseFolder) {

		Path parentDir = FileUtil.getParentDirectory();
		String fileStoragePath = FileUtil.getStorageDirectory(baseFolder, parentDir).toString();

		if (storageFolders.contains(type)) {
			return Paths.get(fileStoragePath, type);
		}
		else {
			return null;
		}
	}

	public static String getThumbnailName(String originalFileName) {
		int dotIndex = originalFileName.lastIndexOf('.');
		return (dotIndex == -1) ? "" : originalFileName.substring(0, originalFileName.indexOf("."))
				+ FileConfigConstants.THUMBNAIL_SUFFIX + originalFileName.substring(originalFileName.indexOf("."));
	}

	public static String getFileExtension(String fileName) {
		int dotIndex = fileName.lastIndexOf('.');
		return (dotIndex == -1) ? "" : fileName.substring(dotIndex + 1);
	}

	public static boolean isSupportedFormat(String filePath) {
		String fileExtension = getFileExtension(filePath);
		return FileConfigConstants.SUPPORTED_FORMATS.contains(fileExtension);
	}

	public static String getFileNameWithoutExtension(String originalFileName) {
		return originalFileName.substring(0, originalFileName.indexOf("."));
	}

}
