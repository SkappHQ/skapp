package com.skapp.enterprise.common.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.AmazonS3DeleteItemRequestDto;
import com.skapp.enterprise.common.payload.request.AmazonS3SignedUrlRequestDto;
import com.skapp.enterprise.common.payload.request.AmazonS3SignedUrlValidatedRequestDto;
import com.skapp.enterprise.common.type.AmazonS3ActionType;
import jakarta.validation.Valid;

import java.io.InputStream;

public interface AmazonS3Service {

	InputStream downloadFile(String bucketName, String objectKey);

	byte[] downloadFileAsBytes(String bucketName, String objectKey);

	void uploadFile(String bucketName, String objectKey, InputStream inputStream);

	ResponseEntityDto getSignedUrl(@Valid AmazonS3SignedUrlRequestDto amazonS3SignedUrlRequestDto);

	String generateSignedUrl(AmazonS3ActionType amazonS3Action, String folderPath, String fileType,
			int durationInMinutes);

	ResponseEntityDto deleteFileFromS3(AmazonS3DeleteItemRequestDto amazonS3DeleteItemRequestDto);

	ResponseEntityDto getSignedUrlWithFileValidations(
			@Valid AmazonS3SignedUrlValidatedRequestDto amazonS3SignedUrlValidatedRequestDto);

	ResponseEntityDto getSignedUrlForEnvelopeTemplate(AmazonS3SignedUrlRequestDto amazonS3SignedUrlRequestDto);

	byte[] downloadFontAsBytes(String folderName, String fontVariant);

	byte[] downloadSvgImageAsBytes(String fileName);

}
