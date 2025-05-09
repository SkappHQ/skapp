package com.skapp.enterprise.esignature.utill;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ValidationException;
import com.skapp.community.peopleplanner.constant.PeopleConstants;
import com.skapp.enterprise.esignature.constant.EsignConstants;
import lombok.experimental.UtilityClass;

import java.util.List;

import static com.skapp.community.common.util.Validation.EMAIL_REGEX;
import static com.skapp.community.common.util.Validation.NAME_REGEX;
import static com.skapp.community.common.util.Validation.PHONE_NUMBER_PATTERN;

@UtilityClass
public class EsignValidations {

	public static void validateName(String name) {
		if (name != null && !name.trim().matches(NAME_REGEX))
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_NAME);

		if (name != null && name.length() > EsignConstants.ESIGN_MAX_NAME_LENGTH_EXTERNAL_USER)
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_NAME_LENGTH,
					List.of(String.valueOf(EsignConstants.ESIGN_MAX_NAME_LENGTH_EXTERNAL_USER)));
	}

}
