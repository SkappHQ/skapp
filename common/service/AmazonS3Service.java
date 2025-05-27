package com.skapp.enterprise.common.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.AmazonS3SignedUrlRequestDto;
import jakarta.validation.Valid;

import java.io.InputStream;

public interface AmazonS3Service {

	InputStream downloadFile(String bucketName, String objectKey);

	byte[] downloadFileAsBytes(String bucketName, String objectKey);

	void uploadFile(String bucketName, String objectKey, InputStream inputStream);

	ResponseEntityDto getSignedUrl(@Valid AmazonS3SignedUrlRequestDto amazonS3SignedUrlRequestDto);

	ResponseEntityDto deleteFileFromS3(String amazonS3DeleteItemRequestDto);

}
