package com.skapp.enterprise.common.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;

public interface ValidationService {

	ResponseEntityDto validateBusinessEmail(String email);

	void validateEmail(String email);

	void checkBusinessEmailValidity(String email);

}
