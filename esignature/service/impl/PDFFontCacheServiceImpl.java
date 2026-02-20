package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.service.PDFFontCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class PDFFontCacheServiceImpl implements PDFFontCacheService {

	@Value("${aws.s3.bucket-name}")
	private String bucketName;

	private final S3Client s3Client;

	private static final String s3BasePath = "eSign/fonts/";

	private final ConcurrentHashMap<String, byte[]> fontByteCache = new ConcurrentHashMap<>();

	public PDType0Font loadFont(PDDocument document, String relativePath) {
		byte[] fontBytes = fontByteCache.computeIfAbsent(relativePath, this::loadAndCache);
		return createFont(document, fontBytes, relativePath);
	}

	private byte[] loadAndCache(String relativePath) {
		String s3Key = bucketName + "/" + s3BasePath + relativePath;
		String bucket = bucketName;

		log.info("[FontCache] Loading font from S3: {}", relativePath);

		GetObjectRequest request = GetObjectRequest.builder().bucket(bucket).key(s3Key).build();

		try (ResponseInputStream<GetObjectResponse> s3Object = s3Client.getObject(request)) {
			byte[] bytes = s3Object.readAllBytes();
			log.info("[FontCache] Cached font '{}' ({} KB)", relativePath, bytes.length / 1024);
			return bytes;
		}
		catch (Exception e) {
			log.warn("Unexpected error loading font from S3:" + relativePath, e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_IN_PDF_FONT_LOADING_VIA_S3);
		}
	}

	private PDType0Font createFont(PDDocument document, byte[] fontBytes, String relativePath) {
		try {
			// ByteArrayInputStream wraps existing byte[] — no copy, no I/O
			return PDType0Font.load(document, new ByteArrayInputStream(fontBytes));
		}
		catch (Exception e) {
			log.warn("Failed to create PDType0Font from cached bytes for: " + relativePath, e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_CREATE_PDF_FONT_FROM_CACHE);

		}
	}

}
