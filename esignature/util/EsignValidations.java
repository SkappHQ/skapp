package com.skapp.enterprise.esignature.util;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ValidationException;
import com.skapp.enterprise.esignature.constant.EsignConstants;
import lombok.experimental.UtilityClass;

import java.util.List;

import static com.skapp.enterprise.esignature.constant.EsignConstants.ALLOWED_CHARACTERS_REGEX_EXTERNAL_CONTACT_NAME;

@UtilityClass
public class EsignValidations {

	public static void validateExternalUserName(String name) {

		if (name != null && name.length() > EsignConstants.ESIGN_MAX_NAME_LENGTH_EXTERNAL_USER)
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_NAME_LENGTH,
					List.of(String.valueOf(EsignConstants.ESIGN_MAX_NAME_LENGTH_EXTERNAL_USER)));
	}

}
