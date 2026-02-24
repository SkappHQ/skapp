package com.skapp.enterprise.esignature.util;

import com.skapp.enterprise.esignature.payload.request.FieldSignContainerDto;
import lombok.experimental.UtilityClass;

@UtilityClass
public class FontStyleExtractorUtil {

	private static final float DEFAULT_FONT_SIZE = 12f;

	public static String extractFontFamily(FieldSignContainerDto container) {
		return container != null ? container.getFontFamily() : null;
	}

	public static String extractFontColor(FieldSignContainerDto container) {
		return container != null ? container.getFontColor() : null;
	}

	public static float extractFontSize(FieldSignContainerDto container) {
		if (container == null) {
			return DEFAULT_FONT_SIZE;
		}
		float size = container.getFontSize();
		return size > 0 ? size : DEFAULT_FONT_SIZE;
	}

	public static boolean extractIsBold(FieldSignContainerDto container) {
		return container != null && Boolean.TRUE.equals(container.getIsBold());
	}

	public static boolean extractIsItalic(FieldSignContainerDto container) {
		return container != null && Boolean.TRUE.equals(container.getIsItalic());
	}

	public static boolean extractIsUnderline(FieldSignContainerDto container) {
		return container != null && Boolean.TRUE.equals(container.getIsUnderline());
	}

}
