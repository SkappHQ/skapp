package com.skapp.enterprise.common.service;

import com.skapp.enterprise.common.payload.request.AmazonS3SignedUrlValidatedRequestDto;

public interface AmazonS3FileValidationService {

	void validateS3FileUpload(AmazonS3SignedUrlValidatedRequestDto amazonS3SignedUrlValidatedRequestDto);

}
