package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.service.AmazonS3Service;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class AmazonS3ServiceImpl implements AmazonS3Service {

	private static final String CONTENT_TYPE = "application/pdf";

	private final S3Client s3Client;

	@Override
	public InputStream downloadFile(String bucketName, String objectKey) {
		try {

			log.info("Downloading file from S3... : downloadFile");

			GetObjectRequest getObjectRequest = GetObjectRequest.builder().bucket(bucketName).key(objectKey).build();

			return s3Client.getObject(getObjectRequest);

		}
		catch (Exception e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_DOWNLOAD_FILE,
					new String[] { e.getMessage() });
		}
	}

	@Async
	@Override
	public void uploadFile(String bucketName, String objectKey, InputStream inputStream) {
		try {
			log.info("Uploading file to S3: {}", objectKey);

			s3Client.putObject(
					PutObjectRequest.builder().bucket(bucketName).key(objectKey).contentType(CONTENT_TYPE).build(),
					RequestBody.fromInputStream(inputStream,
							inputStream.available() > 0 ? inputStream.available() : -1));

			log.info("File uploaded successfully to S3 as: {}", objectKey);
		}
		catch (Exception e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_UPLOAD_FILE,
					new String[] { e.getMessage() });
		}
	}

	@Override
	public byte[] downloadFileAsBytes(String bucketName, String objectKey) {
		try {
			log.info("Downloading file from S3... : downloadFileAsBytes");

			GetObjectRequest getObjectRequest = GetObjectRequest.builder().bucket(bucketName).key(objectKey).build();

			try (ResponseInputStream<GetObjectResponse> inputStream = s3Client.getObject(getObjectRequest);
					ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

				inputStream.transferTo(outputStream);

				return outputStream.toByteArray();
			}
		}
		catch (IOException e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_DOWNLOAD_FILE,
					new String[] { e.getMessage() });
		}
	}

}
