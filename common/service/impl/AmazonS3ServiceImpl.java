package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.payload.request.AmazonS3RequestDto;
import com.skapp.enterprise.common.service.AmazonS3Service;
import com.skapp.enterprise.common.type.AmazonS3ActionType;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class AmazonS3ServiceImpl implements AmazonS3Service {

	private static final String CONTENT_TYPE = "application/pdf";

	private final S3Client s3Client;

	private final S3Presigner s3Presigner;

	@Value("${aws.s3.bucket-name}")
	private String bucketName;

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
	public ResponseEntityDto getSignedUrl(AmazonS3RequestDto amazonS3RequestDto) {
		try {
			log.info("Generating signed URL for action: {}", amazonS3RequestDto.getAction());

			String objectKey = amazonS3RequestDto.getFolderPath();
			if (objectKey == null || objectKey.isEmpty()) {
				log.error("Folder path is null or empty");
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_S3_ACTION_TYPE);
			}

			String signedUrl;
			if (amazonS3RequestDto.getAction() == AmazonS3ActionType.UPLOAD) {
				PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
					.signatureDuration(Duration.ofMinutes(EpCommonConstants.S3_SIGNED_URL_DURATION))
					.putObjectRequest(req -> req.bucket(bucketName).key(objectKey))
					.build();

				signedUrl = s3Presigner.presignPutObject(presignRequest).url().toExternalForm();
				log.info("Signed URL generated successfully for upload: {}", signedUrl);
			}
			else if (amazonS3RequestDto.getAction() == AmazonS3ActionType.DOWNLOAD) {
				GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
					.signatureDuration(Duration.ofMinutes(EpCommonConstants.S3_SIGNED_URL_DURATION))
					.getObjectRequest(req -> req.bucket(bucketName).key(objectKey))
					.build();

				signedUrl = s3Presigner.presignGetObject(presignRequest).url().toExternalForm();
				log.info("Signed URL generated successfully for download: {}", signedUrl);
			}
			else {
				log.error("Invalid action type: {}", amazonS3RequestDto.getAction());
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_S3_ACTION_TYPE);
			}

			return new ResponseEntityDto(false, signedUrl);
		}
		catch (Exception e) {
			log.error("Error generating signed URL: {}", e.getMessage(), e);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SIGNED_URL_GENERATION_FAILED,
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
