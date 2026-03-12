package com.skapp.enterprise.esignature.util;

import com.skapp.enterprise.esignature.payload.request.FieldSignContainerDto;
import lombok.experimental.UtilityClass;

@UtilityClass
public class FontStyleExtractorUtil {

	public static String extractFontFamily(FieldSignContainerDto container) {
		return container != null ? container.getFontFamily() : null;
	}

	public static String extractFontColor(FieldSignContainerDto container) {
		return container.getFontColor();
	}

	public static float extractFontSize(FieldSignContainerDto container) {
		return container.getFontSize();
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

	public static float extractHorizontalPadding(FieldSignContainerDto container) {
		return container.getHorizontalPadding();
	}

	public static float extractVerticalPadding(FieldSignContainerDto container) {
		return container.getVerticalPadding();
	}

	public static float extractLineHeight(FieldSignContainerDto container) {
		return container.getTextLineHeight();
	}

}
