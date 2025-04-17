package com.skapp.enterprise.common.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.response.ValidationResult;

public interface ValidationService {

	ResponseEntityDto validateBusinessEmail(String email);

	ValidationResult validateEmail(String email);
}
