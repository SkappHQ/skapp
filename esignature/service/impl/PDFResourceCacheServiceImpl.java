package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.service.AmazonS3Service;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.service.PDFResourceCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.batik.transcoder.TranscoderInput;
import org.apache.batik.transcoder.TranscoderOutput;
import org.apache.batik.transcoder.image.PNGTranscoder;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class PDFResourceCacheServiceImpl implements PDFResourceCacheService {

	@Value("${aws.s3.bucket-name}")
	private String bucketName;

	private final AmazonS3Service amazonS3Service;

	private final ConcurrentHashMap<String, byte[]> fontByteCache = new ConcurrentHashMap<>();

	public PDType0Font loadFont(PDDocument document, String path) {
		byte[] fontBytes = fontByteCache.computeIfAbsent(path, this::loadAndCache);
		return createFont(document, fontBytes, path);
	}

	@Override
	public PDImageXObject loadSvgImageAndConvertToPng(PDDocument document, String path, float width, float height,
			String name) {

		String s3Key = bucketName + "/" + path;
		String bucket = bucketName;

		byte[] svgBytes = amazonS3Service.downloadFileAsBytes(bucket, s3Key);

		byte[] pngBytes = convertSvgToPng(svgBytes, width, height);

		try {

			return PDImageXObject.createFromByteArray(document, pngBytes, name);
		}
		catch (IOException e) {
			log.error("Error drawCheckbox: {}", e.getMessage(), e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_MERGE_TEXT_FILED);
		}

	}

	private byte[] loadAndCache(String path) {

		String s3Key = bucketName + "/" + path;
		String bucket = bucketName;

		log.info("[FontCache] Loading font from S3: {}", path);

		byte[] bytes = amazonS3Service.downloadFileAsBytes(bucket, s3Key);
		log.info("[FontCache] Cached font '{}' ({} KB)", path, bytes.length / 1024);
		return bytes;
	}

	private PDType0Font createFont(PDDocument document, byte[] fontBytes, String path) {
		try {
			// ByteArrayInputStream wraps existing byte[] — no copy, no I/O
			return PDType0Font.load(document, new ByteArrayInputStream(fontBytes));
		}
		catch (Exception e) {
			log.warn("Failed to create PDType0Font from cached bytes for: " + path, e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_CREATE_PDF_FONT_FROM_CACHE);

		}
	}

	private static byte[] convertSvgToPng(byte[] svgBytes, float width, float height) {
		try (ByteArrayInputStream svgInput = new ByteArrayInputStream(svgBytes);
				ByteArrayOutputStream pngOutput = new ByteArrayOutputStream()) {

			TranscoderInput input = new TranscoderInput(svgInput);
			TranscoderOutput output = new TranscoderOutput(pngOutput);

			PNGTranscoder transcoder = new PNGTranscoder();
			transcoder.addTranscodingHint(PNGTranscoder.KEY_WIDTH, width);
			transcoder.addTranscodingHint(PNGTranscoder.KEY_HEIGHT, height);

			transcoder.transcode(input, output);

			return pngOutput.toByteArray();

		}
		catch (Exception e) {
			log.error("Error converting SVG to PNG", e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_CONVERT_SVG);
		}
	}

}
