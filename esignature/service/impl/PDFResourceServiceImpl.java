package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.service.AmazonS3Service;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.service.PDFResourceService;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class PDFResourceServiceImpl implements PDFResourceService {

	@Value("${aws.s3.bucket-name}")
	private String bucketName;

	private final AmazonS3Service amazonS3Service;

	@Override
	public byte[] loadFontBytes(String path) {
		return loadFontFromS3(path);
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

	private byte[] loadFontFromS3(String path) {

		String s3Key = bucketName + "/" + path;
		String bucket = bucketName;

		log.info("[FontLoad] Loading font from S3: {}", path);

		byte[] bytes = amazonS3Service.downloadFileAsBytes(bucket, s3Key);
		log.info("[FontLoad] Loaded font '{}' ({} KB)", path, bytes.length / 1024);
		return bytes;
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
