package com.skapp.community.common.constant;

import lombok.experimental.UtilityClass;

import java.util.List;
import java.util.regex.Pattern;

@UtilityClass
public class FileConfigConstants {

	public static final String FILE_UPLOAD_PATH = "file.storage";

	public static final String FILE_PROFILE_PIC_PATH = "user-image";

	public static final String FILE_LEAVE_ATTACHMENTS_PATH = "leave-attachments";

	public static final String FILE_LOGO_PATH = "organization-logos";

	public static final String THUMBNAIL_SUFFIX = "-thumbnail";

	public static final int THUMBNAIL_HEIGHT = 150;

	public static final int THUMBNAIL_WIDTH = 150;

	public static final long FILE_UPLOAD_LIMIT_IN_PERCENTAGE = 10L;

	public static final List<String> SUPPORTED_FORMATS = List.of("jpg", "jpeg", "png", "gif", "bmp");

	public static final Pattern STORED_FILE_NAME_PATTERN = Pattern.compile("^[A-Za-z0-9_-][A-Za-z0-9._-]{0,254}$");

}
