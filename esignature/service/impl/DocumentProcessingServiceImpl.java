package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.enterprise.common.service.AmazonS3Service;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.payload.request.FieldSignDto;
import com.skapp.enterprise.esignature.service.DocumentProcessingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.io.RandomAccessReadBuffer;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentProcessingServiceImpl implements DocumentProcessingService {

	private static final float DEFAULT_FONT_SIZE = 12f;

	@Value("${aws.s3.bucket-name}")
	private String bucketName;

	private final AmazonS3Service amazonS3Service;

	private final MessageUtil messageUtil;

	@Override
	public byte[] mergeFields(List<FieldSignDto> fieldSignDtoList, byte[] inputBytes) {
		validateInput(fieldSignDtoList, inputBytes);

		try (RandomAccessReadBuffer randomAccessRead = new RandomAccessReadBuffer(inputBytes);
				PDDocument document = Loader.loadPDF(randomAccessRead);
				ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

			for (FieldSignDto field : fieldSignDtoList) {
				validateField(field);
				PDPage page = getPage(document, field.getPageNumber());
				float pageHeight = page.getMediaBox().getHeight();

				try (PDPageContentStream contentStream = new PDPageContentStream(document, page,
						PDPageContentStream.AppendMode.APPEND, true, true)) {

					switch (field.getType()) {
						case DATE:
							addTextField(field, contentStream, pageHeight);
							break;
						case SIGNATURE, INITIAL, STAMP:
							addImageField(field, contentStream, document, pageHeight);
							break;
						case APPROVE, DECLINE:
							// Do nothing
							break;
						default:
							throw new IllegalArgumentException("Unsupported field type: " + field.getType());
					}
				}
			}

			document.save(outputStream);
			return outputStream.toByteArray();

		}
		catch (IOException e) {
			log.error("Error processing PDF document: {}", e.getMessage());
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_PROCESS_PDF_DOCUMENT);
		}
	}

	private void validateInput(List<FieldSignDto> fields, byte[] inputBytes) {
		if (inputBytes == null || inputBytes.length == 0) {
			throw new IllegalArgumentException(
					messageUtil.getMessage(EsignMessageConstant.ESIGN_VALIDATION_INPUT_STREAM_CANNOT_BE_NULL));
		}
		if (fields == null || fields.isEmpty()) {
			throw new IllegalArgumentException(
					messageUtil.getMessage(EsignMessageConstant.ESIGN_VALIDATION_FIELD_LIST_CANNOT_BE_EMPTY));
		}
	}

	private void validateField(FieldSignDto field) {
		if (field == null) {
			throw new IllegalArgumentException(
					messageUtil.getMessage(EsignMessageConstant.ESIGN_VALIDATION_FIELD_CANNOT_BE_NULL));
		}
		if (field.getPageNumber() < 1) {
			throw new IllegalArgumentException(
					messageUtil.getMessage(EsignMessageConstant.ESIGN_VALIDATION_PAGE_NUMBER_MUST_BE_POSITIVE));
		}
		if (field.getFieldValue() == null || field.getFieldValue().trim().isEmpty()) {
			throw new IllegalArgumentException(
					messageUtil.getMessage(EsignMessageConstant.ESIGN_VALIDATION_FIELD_VALUE_CANNOT_BE_EMPTY));
		}

		if (field.getXposition() < 0 || field.getYposition() < 0) {
			throw new IllegalArgumentException(
					messageUtil.getMessage(EsignMessageConstant.ESIGN_VALIDATION_COORDINATES_MUST_BE_NOT_NEGATIVE));
		}
	}

	private PDPage getPage(PDDocument document, int pageNumber) {
		if (pageNumber > document.getNumberOfPages()) {
			throw new IllegalArgumentException(messageUtil.getMessage(
					EsignMessageConstant.ESIGN_VALIDATION_PAGE_NUMBER_EXCEED_DOCUMENT_PAGE_NUMBER_COUNT,
					new Object[] { pageNumber, document.getNumberOfPages() }));
		}
		return document.getPage(pageNumber - 1);
	}

	private void addTextField(FieldSignDto field, PDPageContentStream contentStream, float pageHeight) {
		// Relative to the co-ordinates taken from UI -top left
		try {
			float adjustedY = pageHeight - field.getYposition();
			contentStream.beginText();
			PDType1Font font = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
			contentStream.setFont(font, DEFAULT_FONT_SIZE);

			// take co-ordinated from bottom-left
			contentStream.newLineAtOffset(field.getXposition(), adjustedY);
			contentStream.showText(field.getFieldValue());
			contentStream.endText();
		}
		catch (Exception e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_MERGE_TEXT_FILED);
		}

	}

	private void addImageField(FieldSignDto field, PDPageContentStream contentStream, PDDocument document,
			float pageHeight) {
		try (InputStream imageStream = amazonS3Service.downloadFile(bucketName, field.getFieldValue())) {

			PDImageXObject image = PDImageXObject.createFromByteArray(document, imageStream.readAllBytes(), "image");
			// Relative to the co-ordinates taken from UI -top left
			float adjustedY = pageHeight - field.getYposition() - field.getHeight();

			// take co-ordinated from bottom-left
			contentStream.drawImage(image, field.getXposition(), adjustedY, field.getWidth(), field.getHeight());

		}
		catch (Exception e) {
			log.error("Failed to load image: {}", field.getFieldValue(), e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_LOAD_IMAGE,
					new String[] { field.getFieldValue() });
		}
	}

}
