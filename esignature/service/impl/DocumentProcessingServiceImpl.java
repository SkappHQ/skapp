package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.service.AmazonS3Service;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.payload.request.FieldSignDto;
import com.skapp.enterprise.esignature.payload.response.ProcessedDocumentResult;
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

import java.io.*;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentProcessingServiceImpl implements DocumentProcessingService {

	private static final float DEFAULT_FONT_SIZE = 12f;

	private static final String FILE_PREFIX = "processed_";

	@Value("${aws.s3.bucket-name}")
	private String bucketName;

	private final AmazonS3Service amazonS3Service;

	@Override
	public ProcessedDocumentResult mergeFields(List<FieldSignDto> fieldSignDtoList, InputStream inputStream) {
		validateInput(fieldSignDtoList, inputStream);

		try {
			// Convert InputStream to byte array
			byte[] inputBytes = inputStream.readAllBytes();

			// Create RandomAccessRead from byte array
			try (RandomAccessReadBuffer randomAccessRead = new RandomAccessReadBuffer(inputBytes);
					PDDocument document = Loader.loadPDF(randomAccessRead);
					ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

				for (FieldSignDto field : fieldSignDtoList) {
					validateField(field);

					PDPage page = getPage(document, field.getPageNumber());
					float pageHeight = page.getMediaBox().getHeight(); // Get page height

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

				// Save the modified document
				document.save(outputStream);

				// Generate unique filename for S3 reference
				String fileUrl = generateFileUrl();

				return new ProcessedDocumentResult(new ByteArrayInputStream(outputStream.toByteArray()), fileUrl);
			}
		}
		catch (IOException e) {
			log.error("Error processing PDF document", e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_PROCESS_PDF_DOCUMENT,
					new String[] { e.getMessage() });
		}
	}

	private void validateInput(List<FieldSignDto> fields, InputStream inputStream) {
		if (inputStream == null) {
			throw new IllegalArgumentException("Input stream cannot be null");
		}
		if (fields == null || fields.isEmpty()) {
			throw new IllegalArgumentException("Field list cannot be null or empty");
		}
	}

	private void validateField(FieldSignDto field) {
		if (field == null) {
			throw new IllegalArgumentException("Field cannot be null");
		}
		if (field.getPageNumber() < 1) {
			throw new IllegalArgumentException("Page number must be positive");
		}
		if (field.getFieldValue() == null || field.getFieldValue().trim().isEmpty()) {
			throw new IllegalArgumentException("Field value cannot be null or empty");
		}
		validateCoordinates(field);
	}

	private void validateCoordinates(FieldSignDto field) {
		if (field.getXposition() < 0 || field.getYposition() < 0) {
			throw new IllegalArgumentException("Coordinates must be non-negative");
		}
	}

	private PDPage getPage(PDDocument document, int pageNumber) {
		if (pageNumber > document.getNumberOfPages()) {
			throw new IllegalArgumentException("Page number " + pageNumber + " exceeds document length of "
					+ document.getNumberOfPages() + " pages");
		}
		return document.getPage(pageNumber - 1);
	}

	private void addTextField(FieldSignDto field, PDPageContentStream contentStream, float pageHeight)
			throws IOException {
		// Relative to the co-ordinates taken from UI -top left
		float adjustedY = pageHeight - field.getYposition();
		contentStream.beginText();
		PDType1Font font = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
		contentStream.setFont(font, DEFAULT_FONT_SIZE);

		// take co-ordinated from bottom-left
		contentStream.newLineAtOffset(field.getXposition(), adjustedY);
		contentStream.showText(field.getFieldValue());
		contentStream.endText();
	}

	private void addImageField(FieldSignDto field, PDPageContentStream contentStream, PDDocument document,
			float pageHeight) throws IOException {
		try (InputStream imageStream = amazonS3Service.downloadFile(bucketName, field.getFieldValue())) {

			try {
				PDImageXObject image = PDImageXObject.createFromByteArray(document, imageStream.readAllBytes(),
						"image");

				// Relative to the co-ordinates taken from UI -top left
				float adjustedY = pageHeight - field.getYposition() - field.getHeight();

				// take co-ordinated from bottom-left
				contentStream.drawImage(image, field.getXposition(), adjustedY, field.getWidth(), field.getHeight());
			}
			catch (IOException e) {
				log.error("Failed to load image: {}", field.getFieldValue(), e);
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_LOAD_IMAGE,
						new String[] { field.getFieldValue() });
			}
		}
	}

	private String generateFileUrl() {
		return FILE_PREFIX + UUID.randomUUID().toString() + ".pdf";
	}

}
