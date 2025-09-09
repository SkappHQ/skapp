package com.skapp.enterprise.common.util;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import lombok.experimental.UtilityClass;

import java.util.Arrays;

@UtilityClass
public class DtoStringTrimmer {

	public static <T> T trimStrings(T dto) {
		if (dto == null)
			return null;
		Arrays.stream(dto.getClass().getDeclaredFields())
			.filter(field -> field.getType() == String.class)
			.forEach(field -> {
				field.setAccessible(true);
				try {
					String value = (String) field.get(dto);
					if (value != null) {
						field.set(dto, value.trim());
					}
				}
				catch (IllegalAccessException e) {
					throw new ModuleException(
							EPCommonMessageConstant.EP_COMMON_ERROR_DTO_STRING_TRIMMER_REFLECTION_ERROR);
				}
			});
		return dto;
	}

}
