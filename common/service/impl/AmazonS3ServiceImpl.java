package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.payload.request.AmazonS3DeleteItemRequestDto;
import com.skapp.enterprise.common.payload.request.AmazonS3SignedUrlRequestDto;
import com.skapp.enterprise.common.payload.request.AmazonS3SignedUrlValidatedRequestDto;
import com.skapp.enterprise.common.payload.response.AmazonS3SignedUrlResponseDto;
import com.skapp.enterprise.common.service.AmazonS3FileValidationService;
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
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectResponse;
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

	String RESOURCE_BASE_PATH = "common/";

	String FONT_BASE_PATH = "fonts/";

	String SVG_BASE_PATH = "svgs/";

	String TTF_FILE_EXTENSION = ".ttf";

	private final S3Client s3Client;

	private final S3Presigner s3Presigner;

	@Value("${aws.s3.bucket-name}")
	private String bucketName;

	private final AmazonS3FileValidationService amazonS3FileValidationService;

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

	/**
	 * Generates a signed URL for accessing an object in an Amazon S3 bucket.
	 * @param amazonS3SignedUrlRequestDto the request object containing details such as
	 * the bucket name, object key, and any additional parameters required for generating
	 * the signed URL.
	 * @return a {@link ResponseEntityDto} containing the signed URL and any additional
	 * metadata.
	 * @throws jakarta.validation.ConstraintViolationException if the input validation
	 * fails.
	 * @throws RuntimeException if an error occurs while generating the signed URL.
	 */
	@Override
	public ResponseEntityDto getSignedUrl(AmazonS3SignedUrlRequestDto amazonS3SignedUrlRequestDto) {
		try {
			log.info("Generating signed URL for action: {}", amazonS3SignedUrlRequestDto.getAction());

			AmazonS3SignedUrlResponseDto responseDto = new AmazonS3SignedUrlResponseDto();
			responseDto.setSignedUrl(generateSignedUrl(amazonS3SignedUrlRequestDto.getAction(),
					amazonS3SignedUrlRequestDto.getFolderPath(), amazonS3SignedUrlRequestDto.getFileType(),
					EpCommonConstants.S3_SIGNED_URL_DURATION));

			return new ResponseEntityDto(false, responseDto);
		}
		catch (Exception e) {
			log.error("Error generating signed URL: {}", e.getMessage(), e);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SIGNED_URL_GENERATION_FAILED,
					new String[] { e.getMessage() });
		}
	}

	@Override
	public String generateSignedUrl(AmazonS3ActionType amazonS3Action, String folderPath, String fileType,
			int durationInMinutes) {
		if (folderPath == null || folderPath.isEmpty()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_S3_FOLDER_PATH);
		}

		String objectKey = bucketName + "/" + folderPath;

		return switch (amazonS3Action) {
			case UPLOAD -> {
				PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
					.signatureDuration(Duration.ofMinutes(durationInMinutes))
					.putObjectRequest(req -> req.bucket(bucketName).key(objectKey).contentType(fileType))
					.build();

				yield s3Presigner.presignPutObject(presignRequest).url().toExternalForm();
			}
			case DOWNLOAD -> {
				GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
					.signatureDuration(Duration.ofMinutes(durationInMinutes))
					.getObjectRequest(req -> req.bucket(bucketName).key(objectKey))
					.build();

				yield s3Presigner.presignGetObject(presignRequest).url().toExternalForm();
			}
		};
	}

	@Override
	public ResponseEntityDto deleteFileFromS3(AmazonS3DeleteItemRequestDto amazonS3DeleteItemRequestDto) {
		try {
			String objectKey = amazonS3DeleteItemRequestDto.getFolderPath();
			if (objectKey == null || objectKey.isEmpty()) {
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_S3_FOLDER_PATH);
			}

			DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
				.bucket(bucketName)
				.key(objectKey)
				.build();

			DeleteObjectResponse response = s3Client.deleteObject(deleteObjectRequest);

			int status = response.sdkHttpResponse().statusCode();
			if (status >= 200 && status < 300) {
				log.info("File deleted successfully: {}", objectKey);
				return new ResponseEntityDto(false, "File deleted successfully");
			}
			else {
				log.error("File deletion failed: {}", objectKey);
				return new ResponseEntityDto(true, "File deletion failed");
			}
		}
		catch (Exception e) {
			log.error("Error deleting file: {}", e.getMessage(), e);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SIGNED_URL_GENERATION_FAILED,
					new String[] { e.getMessage() });
		}
	}

	@Override
	public ResponseEntityDto getSignedUrlWithFileValidations(
			AmazonS3SignedUrlValidatedRequestDto amazonS3SignedUrlValidatedRequestDto) {

		amazonS3FileValidationService.validateS3FileUpload(amazonS3SignedUrlValidatedRequestDto);

		AmazonS3SignedUrlRequestDto amazonS3SignedUrlRequestDto = new AmazonS3SignedUrlRequestDto();
		amazonS3SignedUrlRequestDto.setFolderPath(amazonS3SignedUrlValidatedRequestDto.getFolderPath());
		amazonS3SignedUrlRequestDto.setFileType(amazonS3SignedUrlValidatedRequestDto.getFileType());
		amazonS3SignedUrlRequestDto.setAction(amazonS3SignedUrlValidatedRequestDto.getAction());

		return getSignedUrl(amazonS3SignedUrlRequestDto);
	}

	@Override
	public ResponseEntityDto getSignedUrlForEnvelopeTemplate(AmazonS3SignedUrlRequestDto amazonS3SignedUrlRequestDto) {

		log.info("Generating signed URL for action: {}", amazonS3SignedUrlRequestDto.getAction());

		amazonS3FileValidationService.validateS3FileUploadFileType(amazonS3SignedUrlRequestDto.getFileType());

		AmazonS3SignedUrlResponseDto responseDto = new AmazonS3SignedUrlResponseDto();
		responseDto.setSignedUrl(
				generateSignedUrl(amazonS3SignedUrlRequestDto.getAction(), amazonS3SignedUrlRequestDto.getFolderPath(),
						amazonS3SignedUrlRequestDto.getFileType(), EpCommonConstants.S3_SIGNED_URL_DURATION));

		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	public byte[] downloadFontAsBytes(String folderName, String fontVariant) {

		String filename = folderName + fontVariant + TTF_FILE_EXTENSION;
		String filePath = RESOURCE_BASE_PATH + FONT_BASE_PATH + folderName + "/" + filename;

		String s3Key = bucketName + "/" + filePath;
		String bucket = bucketName;

		log.info("[FontLoad] Loading font from S3: {}", filePath);

		byte[] bytes = downloadFileAsBytes(bucket, s3Key);
		log.info("[FontLoad] Loaded font '{}' ({} KB)", filePath, bytes.length / 1024);
		return bytes;
	}

	@Override
	public byte[] downloadSvgImageAsBytes(String fileName) {

		String filePath = RESOURCE_BASE_PATH + SVG_BASE_PATH + fileName;

		String s3Key = bucketName + "/" + filePath;
		String bucket = bucketName;

		log.info("[ImageLoad] Loading svg from S3: {}", filePath);

		byte[] bytes = downloadFileAsBytes(bucket, s3Key);
		log.info("[ImageLoad] Loaded svg '{}' ({} KB)", filePath, bytes.length / 1024);
		return bytes;
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
