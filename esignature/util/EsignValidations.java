package com.skapp.enterprise.esignature.util;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.exception.ValidationException;
import com.skapp.enterprise.esignature.constant.EsignConstants;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import lombok.experimental.UtilityClass;

import java.math.BigDecimal;
import java.util.List;

@UtilityClass
public class EsignValidations {

	public static void validateExternalUserName(String name) {

		if (name != null && name.length() > EsignConstants.ESIGN_MAX_NAME_LENGTH_EXTERNAL_USER)
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_NAME_LENGTH,
					List.of(String.valueOf(EsignConstants.ESIGN_MAX_NAME_LENGTH_EXTERNAL_USER)));
	}

	public static void validateEnvelopeFieldMetaData(Float widthPercentage, Float heightPercentage) {

		if (widthPercentage == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FIELD_WIDTH_PERCENTAGE_REQUIRED);
		}

		if (heightPercentage == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FIELD_HEIGHT_PERCENTAGE_REQUIRED);
		}

		if (widthPercentage <= 0 || widthPercentage >= 100) {
			throw new ModuleException(
					EsignMessageConstant.ESIGN_ERROR_FIELD_WIDTH_PERCENTAGE_MUST_BE_BETWEEN_0_AND_100);
		}

		if (heightPercentage <= 0 || heightPercentage >= 100) {
			throw new ModuleException(
					EsignMessageConstant.ESIGN_ERROR_FIELD_HEIGHT_PERCENTAGE_MUST_BE_BETWEEN_0_AND_100);
		}

		// Validate max 2 decimal places
		BigDecimal widthBD = BigDecimal.valueOf(widthPercentage).stripTrailingZeros();
		if (widthBD.scale() > 2) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FIELD_WIDTH_PERCENTAGE_MAX_TWO_DECIMAL_PLACES);
		}

		BigDecimal heightBD = BigDecimal.valueOf(heightPercentage).stripTrailingZeros();
		if (heightBD.scale() > 2) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FIELD_HEIGHT_PERCENTAGE_MAX_TWO_DECIMAL_PLACES);
		}
	}

}
