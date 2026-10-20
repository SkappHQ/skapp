package com.skapp.community.common.util;

import com.skapp.community.common.constant.FileConfigConstants;
import com.skapp.community.common.constant.ValidationConstant;
import lombok.experimental.UtilityClass;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

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

	public static Path resolveFileInDirectory(Path directory, String fileName) {
		if (fileName == null || !ValidationConstant.STORED_FILE_NAME_PATTERN.matcher(fileName).matches()) {
			return null;
		}

		return directory.resolve(fileName);
	}

	public static String buildStoredFileName(String originalFileName) {
		String extension = getFileExtension(originalFileName);
		if (!ValidationConstant.STORED_FILE_EXTENSION_PATTERN.matcher(extension).matches()) {
			return UUID.randomUUID().toString();
		}

		return UUID.randomUUID() + "." + extension;
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
