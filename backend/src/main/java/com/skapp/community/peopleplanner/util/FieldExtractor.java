package com.skapp.community.peopleplanner.util;

import lombok.extern.slf4j.Slf4j;

import java.lang.invoke.SerializedLambda;
import java.lang.reflect.Method;
import java.util.function.Function;
import java.util.regex.Pattern;

@Slf4j
public final class FieldExtractor {

	private static final Pattern GET_PATTERN = Pattern.compile("^get([A-Z].*?)$");

	private static final Pattern IS_PATTERN = Pattern.compile("^is([A-Z].*?)$");

	private FieldExtractor() {
	}

	public static <T, R> String getFieldName(SerializableFunction<T, R> getter) {
		try {
			Method writeReplace = getter.getClass().getDeclaredMethod("writeReplace");
			writeReplace.setAccessible(true);
			SerializedLambda serializedLambda = (SerializedLambda) writeReplace.invoke(getter);

			String methodName = serializedLambda.getImplMethodName();

			java.util.regex.Matcher getMatcher = GET_PATTERN.matcher(methodName);
			if (getMatcher.matches()) {
				String fieldName = getMatcher.group(1);
				return fieldName.substring(0, 1).toLowerCase() + fieldName.substring(1);
			}

			java.util.regex.Matcher isMatcher = IS_PATTERN.matcher(methodName);
			if (isMatcher.matches()) {
				String fieldName = isMatcher.group(1);
				return fieldName.substring(0, 1).toLowerCase() + fieldName.substring(1);
			}

			return methodName;
		}
		catch (Exception e) {
			log.error("Error extracting field name", e);
			return "";
		}
	}

	@FunctionalInterface
	public interface SerializableFunction<T, R> extends Function<T, R>, java.io.Serializable {

	}

}
