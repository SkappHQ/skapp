package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.payload.request.FieldSignContainerDto;
import com.skapp.enterprise.esignature.payload.request.FieldSignDto;
import com.skapp.enterprise.esignature.payload.response.PageDimensionResponseDto;
import com.skapp.enterprise.esignature.service.DocumentProcessingService;
import com.skapp.enterprise.esignature.service.PDFResourceCacheService;
import com.skapp.enterprise.esignature.type.EsignFontFamilyType;
import com.skapp.enterprise.esignature.type.FieldType;
import com.skapp.enterprise.esignature.type.FontVariantType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.io.RandomAccessReadBuffer;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentProcessingServiceImpl implements DocumentProcessingService {

	private static final float DEFAULT_FONT_SIZE = 12f;

	private static final float UUID_FONT_SIZE = 10f;

	private static final float UUID_X_POSITION = 40;

	private static final float UUID_Y_POSITION = 20;

	// sign by template params

	private static final float BORDER_THICKNESS = 1.0f;

	private static final Color BORDER_COLOR = new Color(42, 97, 160);

	private static final Color TEXT_COLOR = new Color(82, 82, 91);

	private static final float FONT_SIZE = 8.0f;

	private static final float CORNER_RADIUS = 5.0f;

	private static final float TEXT_PADDING = 3.0f;

	private static final float BORDER_IMAGE_PADDING = 1.0f; // 1.0f to match the front end

	private static final float Y_OFFSET_VALUE = 2.0f;

	private static final float X_OFFSET_VALUE = 0.8f;

	// The standard DPI for points in PDF and PostScript. 1 point = 1/72 inch.
	private static final float STANDARD_DPI = 72f;

	// The typical DPI for screen pixels
	private static final float PDFBOX_DPI = 96f;

	public static final float COLOR_NORMALIZATION_FACTOR = 255f;

	private static final float UNDERLINE_OFFSET = 1.5f;

	private static final float UNDERLINE_THICKNESS = 0.5f;

	// In PDFBox, font.getStringWidth() returns the width in "glyph units" (not points).
	// Most fonts use 1000 glyph units per em square. Dividing by 1000 converts the width
	// to "em" units, which can then be multiplied by the font size to get the actual
	// width in points.
	// Purpose:
	// 1000 normalizes the glyph width to a scale compatible with the font size, so the
	// result is the text width in points for rendering.
	private static final int GLYPH_TO_EM_UNIT = 1000;

	private static final String DEFAULT_LABEL = "Signed by";

	private static final String FONT_PATH = "enterprise/fonts/Poppins/Poppins-Regular.ttf";

	public static final int DPI = 96;

	public static final String PNG = "png";

	private static final String RESOURCE_BASE_PATH = "eSign/resources/";

	private static final String FONT_BASE_PATH = "fonts/";

	private static final String SVG_BASE_PATH = "images/";

	private static final String CHECKBOX = "checkbox";

	private static final String RADIO_BUTTON = "radio";

	private static final String CHECKBOX_CHECKED = "checkbox-checked.svg";

	private static final String CHECKBOX_UNCHECKED = "checkbox-unchecked.svg";

	private static final String RADIO_BUTTON_CHECKED = "radio-button-checked.svg";

	private static final String RADIO_BUTTON_UNCHECKED = "radio-button-unchecked.svg";

	private static final String DEJAVU_SANS = "DejaVuSans";

	private static final String NOTO_SANS_JP = "NotoSansJP";

	private static final String TFF_FILE = ".ttf";

	private static final Map<FontVariantType, String> DEJAVU_SANS_VARIANT_MAP = Map.of(FontVariantType.BOLD_ITALIC,
			"DejaVuSans-BoldOblique.ttf", FontVariantType.BOLD, "DejaVuSans-Bold.ttf", FontVariantType.ITALIC,
			"DejaVuSans-Oblique.ttf", FontVariantType.REGULAR, "DejaVuSans.ttf");

	private final MessageUtil messageUtil;

	@Value("${aws.s3.bucket-name}")
	private String bucketName;

	private final PDFResourceCacheService pdfResourceCacheService;

	@Override
	public byte[] mergeTextFieldToDocument(FieldSignDto field, byte[] inputBytes) {

		if (inputBytes == null || inputBytes.length == 0) {
			throw new IllegalArgumentException(
					messageUtil.getMessage(EsignMessageConstant.ESIGN_VALIDATION_INPUT_STREAM_CANNOT_BE_NULL));
		}

		if (field == null) {
			throw new IllegalArgumentException(
					messageUtil.getMessage(EsignMessageConstant.ESIGN_VALIDATION_FIELD_LIST_CANNOT_BE_EMPTY));
		}

		try (RandomAccessReadBuffer randomAccessRead = new RandomAccessReadBuffer(inputBytes);
				PDDocument document = Loader.loadPDF(randomAccessRead);
				ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

			validateField(field);
			PDPage page = getPage(document, field.getPageNumber());
			float pageHeight = page.getMediaBox().getHeight();

			try (PDPageContentStream contentStream = new PDPageContentStream(document, page,
					PDPageContentStream.AppendMode.APPEND, true, true)) {
				addTextField(field, contentStream, pageHeight, document);
			}

			document.save(outputStream);
			return outputStream.toByteArray();

		}
		catch (IOException e) {
			log.error("Error processing PDF document: {}", e.getMessage());
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_PROCESS_PDF_DOCUMENT);
		}
	}

	@Override
	public byte[] updateEnvelopeUuidToEachPage(String value, byte[] inputBytes, int numOfPages) {

		if (inputBytes == null || inputBytes.length == 0) {
			throw new IllegalArgumentException(
					messageUtil.getMessage(EsignMessageConstant.ESIGN_VALIDATION_INPUT_STREAM_CANNOT_BE_NULL));
		}

		if (value == null) {
			throw new IllegalArgumentException(
					messageUtil.getMessage(EsignMessageConstant.ESIGN_VALIDATION_FIELD_LIST_CANNOT_BE_EMPTY));
		}

		try (RandomAccessReadBuffer randomAccessRead = new RandomAccessReadBuffer(inputBytes);
				PDDocument document = Loader.loadPDF(randomAccessRead);
				ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

			// Handle encrypted documents by removing security
			if (document.isEncrypted()) {
				document.setAllSecurityToBeRemoved(true);
			}

			for (int i = 0; i < numOfPages; i++) {
				PDPage page = document.getPage(i);
				float pageHeight = page.getMediaBox().getHeight();

				try (PDPageContentStream contentStream = new PDPageContentStream(document, page,
						PDPageContentStream.AppendMode.APPEND, true, true)) {
					float adjustedY = pageHeight - UUID_Y_POSITION;
					PDType0Font font = loadFont(document);
					float textWidth = font.getStringWidth(value) / 1000 * UUID_FONT_SIZE;
					float textHeight = font.getFontDescriptor().getFontBoundingBox().getHeight() / 1000
							* UUID_FONT_SIZE;

					// Set different paddings for horizontal and vertical sides
					float verticalPadding = 1.0f;
					float horizontalPadding = 6.0f; // Increased horizontal padding
					float borderRadius = 4.0f; // Border radius of 4px

					float rectWidth = textWidth + (horizontalPadding * 2);
					float rectHeight = textHeight + (verticalPadding * 2);

					// Calculate positions for centered text in rectangle
					float rectY = adjustedY - rectHeight;
					float rectX = UUID_X_POSITION - horizontalPadding;

					// Calculate text position to center it within the rectangle
					float textY = rectY + verticalPadding + (textHeight * 0.25f);
					float textX = UUID_X_POSITION;

					// Draw rounded rectangle with white background
					drawRoundedRectangle(contentStream, rectX, rectY, rectWidth, rectHeight, borderRadius,
							new Color(1f, 1f, 1f)); // White color

					// Add text in black color
					contentStream.setNonStrokingColor(0, 0, 0); // Black color for text
					contentStream.beginText();
					contentStream.setFont(font, UUID_FONT_SIZE);
					contentStream.newLineAtOffset(textX, textY);
					contentStream.showText(value);
					contentStream.endText();
				}
			}

			document.save(outputStream);
			return outputStream.toByteArray();

		}
		catch (IOException e) {
			log.error("Error processing envelop Uuid PDF document: {}", e.getMessage());
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_PROCESS_PDF_DOCUMENT);
		}
	}

	// Draws a filled rounded rectangle with the specified parameters.
	private void drawRoundedRectangle(PDPageContentStream contentStream, float x, float y, float width, float height,
			float radius, Color color) throws IOException {
		contentStream.setNonStrokingColor(color.getRed() / 255f, color.getGreen() / 255f, color.getBlue() / 255f);

		// Draw rounded rectangle
		contentStream.moveTo(x + radius, y);
		contentStream.lineTo(x + width - radius, y);
		contentStream.curveTo(x + width - radius / 2, y, x + width, y + radius / 2, x + width, y + radius);
		contentStream.lineTo(x + width, y + height - radius);
		contentStream.curveTo(x + width, y + height - radius / 2, x + width - radius / 2, y + height,
				x + width - radius, y + height);
		contentStream.lineTo(x + radius, y + height);
		contentStream.curveTo(x + radius / 2, y + height, x, y + height - radius / 2, x, y + height - radius);
		contentStream.lineTo(x, y + radius);
		contentStream.curveTo(x, y + radius / 2, x + radius / 2, y, x + radius, y);
		contentStream.closePath();
		contentStream.fill();
	}

	@Override
	public byte[] mergeImageFieldToDocument(FieldSignDto field, byte[] inputBytes, byte[] imageBytes) {

		if (inputBytes == null || inputBytes.length == 0) {
			throw new IllegalArgumentException(
					messageUtil.getMessage(EsignMessageConstant.ESIGN_VALIDATION_INPUT_STREAM_CANNOT_BE_NULL));
		}

		if (imageBytes == null || imageBytes.length == 0) {
			throw new IllegalArgumentException(
					messageUtil.getMessage(EsignMessageConstant.ESIGN_VALIDATION_INPUT_STREAM_CANNOT_BE_NULL));
		}

		if (field == null) {
			throw new IllegalArgumentException(
					messageUtil.getMessage(EsignMessageConstant.ESIGN_VALIDATION_FIELD_LIST_CANNOT_BE_EMPTY));
		}

		return addImageFieldWithBorderTemplate(inputBytes, imageBytes, field);
	}

	@Override
	public int getNumberOfPages(byte[] inputBytes) {
		try (RandomAccessReadBuffer randomAccessRead = new RandomAccessReadBuffer(inputBytes);
				PDDocument document = Loader.loadPDF(randomAccessRead)) {
			return document.getNumberOfPages();
		}
		catch (IOException e) {
			log.error("Error processing getNumberOfPages: {}", e.getMessage(), e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_PROCESS_PDF_DOCUMENT);
		}
	}

	@Override
	public Map<Integer, PageDimensionResponseDto> processDocumentDimensions(byte[] documentBytes) {
		try (RandomAccessReadBuffer randomAccessRead = new RandomAccessReadBuffer(documentBytes);
				PDDocument document = Loader.loadPDF(randomAccessRead)) {
			Map<Integer, PageDimensionResponseDto> documentDimensionsData = new HashMap<>();
			int pageCount = document.getNumberOfPages();
			for (int i = 0; i < pageCount; i++) {
				PDPage page = document.getPage(i);
				PDRectangle mediaBox = page.getMediaBox();
				documentDimensionsData.put(i + 1,
						new PageDimensionResponseDto(mediaBox.getWidth(), mediaBox.getHeight()));
			}
			return documentDimensionsData;
		}
		catch (IOException e) {
			log.error("Error processDocumentDimensions: {}", e.getMessage(), e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_PROCESS_PDF_DOCUMENT);
		}
	}

	@Override
	public List<byte[]> convertPDFdocumentToImageList(byte[] documentBytes) {

		return convertPDFPagesToImages(documentBytes, null);

	}

	@Override
	public byte[] convertPDFdocumentToImage(byte[] documentBytes, int pageNumber) {

		List<byte[]> images = convertPDFPagesToImages(documentBytes, pageNumber);
		return images.isEmpty() ? null : images.getFirst();

	}

	private PDPage getPage(PDDocument document, int pageNumber) {
		if (pageNumber > document.getNumberOfPages()) {
			throw new IllegalArgumentException(messageUtil.getMessage(
					EsignMessageConstant.ESIGN_VALIDATION_PAGE_NUMBER_EXCEED_DOCUMENT_PAGE_NUMBER_COUNT,
					new Object[] { pageNumber, document.getNumberOfPages() }));
		}
		return document.getPage(pageNumber - 1);
	}

	private void addTextField(FieldSignDto field, PDPageContentStream contentStream, float pageHeight,
			PDDocument document) {

		try {

			FieldType fieldType = field.getType();

			if (FieldType.CHECKBOX.equals(fieldType)) {
				drawCheckbox(field, contentStream, pageHeight, document);
			}
			else

			if (FieldType.RADIO_BUTTON.equals(fieldType)) {

				drawRadioButton(field, contentStream, pageHeight, document);
			}

			else if (FieldType.TEXT.equals(fieldType)) {
				addInputTextField(field, contentStream, pageHeight, document);
			}
			else {
				// Adjust baseline offset for Y position
				float yOffset = DEFAULT_FONT_SIZE * Y_OFFSET_VALUE;
				float adjustedY = pageHeight - field.getYposition() - yOffset;

				// Adjust baseline offset for x position
				float xOffset = DEFAULT_FONT_SIZE * X_OFFSET_VALUE;
				float adjustedX = field.getXposition() + xOffset;

				contentStream.beginText();
				PDType0Font font = loadFont(document);
				contentStream.setFont(font, DEFAULT_FONT_SIZE);

				// Position text at adjusted coordinates
				contentStream.newLineAtOffset(adjustedX, adjustedY);
				contentStream.showText(field.getFieldValue());
				contentStream.endText();
			}
		}
		catch (Exception e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_MERGE_TEXT_FILED);
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

		if (field.getType() == null) {
			throw new IllegalArgumentException(
					messageUtil.getMessage(EsignMessageConstant.ESIGN_VALIDATION_FIELD_TYPE_CANNOT_BE_NULL));
		}

		if (field.getType() != FieldType.CHECKBOX
				&& (field.getFieldValue() == null || field.getFieldValue().trim().isEmpty())) {
			throw new IllegalArgumentException(
					messageUtil.getMessage(EsignMessageConstant.ESIGN_VALIDATION_FIELD_VALUE_CANNOT_BE_EMPTY));
		}

		if (field.getXposition() < 0 || field.getYposition() < 0) {
			throw new IllegalArgumentException(
					messageUtil.getMessage(EsignMessageConstant.ESIGN_VALIDATION_COORDINATES_MUST_BE_NOT_NEGATIVE));
		}
	}

	public byte[] addImageFieldWithBorderTemplate(byte[] inputBytes, byte[] imageBytes, FieldSignDto field) {
		Objects.requireNonNull(inputBytes, "Input PDF bytes cannot be null");

		int pageNumber = field.getPageNumber();
		float x = field.getXposition();
		float y = field.getYposition();
		float width = field.getWidth();
		float height = field.getHeight();

		try (RandomAccessReadBuffer randomAccessRead = new RandomAccessReadBuffer(inputBytes);
				PDDocument document = Loader.loadPDF(randomAccessRead);
				ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

			if (pageNumber < 1 || pageNumber > document.getNumberOfPages()) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_INVALID_PAGE_NUMBER);
			}

			PDPage page = document.getPage(pageNumber - 1);
			float pageHeight = page.getMediaBox().getHeight();

			float adjustedY = pageHeight - y - height;

			// border create with given field width and height
			drawImageWithBorder(document, page, x, adjustedY, width, height, imageBytes);

			document.save(outputStream);
			return outputStream.toByteArray();
		}
		catch (IOException e) {
			log.error("Error processing: addSignatureWithBorder : {}", e.getMessage());
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_PROCESS_PDF_DOCUMENT);
		}
	}

	private BorderDimensions calculateBorderDimensions(float imageX, float imageY, float imageWidth,
			float imageHeight) {
		float borderWidth = imageWidth;
		float borderHeight = imageHeight + (BORDER_IMAGE_PADDING * 2);
		float borderX = imageX;
		float borderY = imageY - BORDER_IMAGE_PADDING;

		return new BorderDimensions(borderX, borderY, borderWidth, borderHeight);
	}

	private void drawImageWithBorder(PDDocument document, PDPage page, float imageX, float imageY, float imageWidth,
			float imageHeight, byte[] imageBytes) {

		try (PDPageContentStream contentStream = new PDPageContentStream(document, page,
				PDPageContentStream.AppendMode.APPEND, true, true)) {

			PDType0Font font = loadFont(document);
			TextDimensions textDim = calculateTextDimensions(font, DEFAULT_LABEL);

			BorderDimensions borderDim = calculateBorderDimensions(imageX, imageY, imageWidth, imageHeight);

			if (imageBytes != null) {
				drawInputImage(document, contentStream, imageX, imageY, imageWidth, imageHeight, imageBytes);
			}

			float textX = borderDim.x + (borderDim.width - textDim.width) / 2;
			float textY = borderDim.y + borderDim.height - 1;
			drawTextLabel(contentStream, font, textX, textY, DEFAULT_LABEL);

			float leftGapEnd = textX - TEXT_PADDING;
			float rightGapStart = textX + textDim.width + TEXT_PADDING;

			drawBorderWithTextGap(contentStream, borderDim, leftGapEnd, rightGapStart);
		}
		catch (IOException e) {
			log.error("Error processing: drawSignatureWithBorder : {}", e.getMessage());
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_PROCESS_PDF_DOCUMENT);
		}
	}

	private PDType0Font loadFont(PDDocument document) {
		try (InputStream fontStream = getClass().getClassLoader().getResourceAsStream(FONT_PATH)) {

			if (fontStream == null) {
				log.error("font file not found");
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_LOAD_FONT);
			}

			return PDType0Font.load(document, fontStream);
		}
		catch (IOException e) {
			log.error("Error processing: loadFont : {}", e.getMessage());
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_LOAD_FONT);
		}
	}

	private TextDimensions calculateTextDimensions(PDType0Font font, String text) {
		float width = 0;
		try {
			width = font.getStringWidth(text) / 1000 * FONT_SIZE;
			float height = font.getFontDescriptor().getFontBoundingBox().getHeight() / 1000 * FONT_SIZE;
			return new TextDimensions(width, height);
		}
		catch (IOException e) {
			log.error("Error processing: calculateTextDimensions : {}", e.getMessage());
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_LOAD_FONT);
		}

	}

	private void drawTextLabel(PDPageContentStream contentStream, PDType0Font font, float x, float y, String text) {
		try {
			contentStream.beginText();
			contentStream.setFont(font, FONT_SIZE);
			contentStream.setNonStrokingColor(TEXT_COLOR.getRed() / 255f, TEXT_COLOR.getGreen() / 255f,
					TEXT_COLOR.getBlue() / 255f);
			contentStream.newLineAtOffset(x, y);
			contentStream.showText(text);
			contentStream.endText();
		}
		catch (IOException e) {
			log.error("Error processing: drawTextLabel : {}", e.getMessage());
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_PROCESS_PDF_DOCUMENT);
		}
	}

	private void drawInputImage(PDDocument document, PDPageContentStream contentStream, float x, float y, float width,
			float height, byte[] imageBytes) {
		PDImageXObject image = null;
		try {
			image = PDImageXObject.createFromByteArray(document, imageBytes, "image");
			float imageWidth = image.getWidth();
			float imageHeight = image.getHeight();

			// Define a pixel to point conversion factor (typically 72 DPI for PDFs)
			float pixelToPoint = 72f / 77f;

			// Convert dimensions from pixels to points
			float adjustedWidth = width * pixelToPoint;
			// Reduce height to account for border padding (top and bottom)
			float adjustedHeight = (height - (BORDER_IMAGE_PADDING * 2)) * pixelToPoint;

			// Maintain aspect ratio while fitting within the bounds
			float scale = Math.min(adjustedWidth / imageWidth, adjustedHeight / imageHeight);
			float scaledWidth = imageWidth * scale;
			float scaledHeight = imageHeight * scale;

			// Center the image horizontally and vertically within available space
			float imageX = x + (width - scaledWidth) / 2;
			// Position image with padding adjustment
			float imageY = y + BORDER_IMAGE_PADDING + (height - BORDER_IMAGE_PADDING * 2 - scaledHeight) / 2;

			// Draw the image with exact dimensions
			contentStream.drawImage(image, imageX, imageY, scaledWidth, scaledHeight);

			log.debug("Drawing image at ({}, {}) with dimensions: {}x{}", imageX, imageY, scaledWidth, scaledHeight);
		}
		catch (IOException e) {
			log.error("Error processing: drawInputImage : {}", e.getMessage());
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_PROCESS_PDF_DOCUMENT);
		}
	}

	private void drawBorderWithTextGap(PDPageContentStream contentStream, BorderDimensions borderDim, float leftGapEnd,
			float rightGapStart) {
		try {
			contentStream.setLineWidth(BORDER_THICKNESS);
			contentStream.setStrokingColor(BORDER_COLOR.getRed() / 255f, BORDER_COLOR.getGreen() / 255f,
					BORDER_COLOR.getBlue() / 255f);

			contentStream.moveTo(borderDim.x + CORNER_RADIUS, borderDim.y + borderDim.height);
			contentStream.lineTo(leftGapEnd, borderDim.y + borderDim.height);
			contentStream.moveTo(rightGapStart, borderDim.y + borderDim.height);
			contentStream.lineTo(borderDim.x + borderDim.width - CORNER_RADIUS, borderDim.y + borderDim.height);

			contentStream.moveTo(borderDim.x + borderDim.width, borderDim.y + borderDim.height - CORNER_RADIUS);
			contentStream.lineTo(borderDim.x + borderDim.width, borderDim.y + CORNER_RADIUS);

			contentStream.moveTo(borderDim.x + borderDim.width - CORNER_RADIUS, borderDim.y);
			contentStream.lineTo(borderDim.x + CORNER_RADIUS, borderDim.y);

			contentStream.moveTo(borderDim.x, borderDim.y + CORNER_RADIUS);
			contentStream.lineTo(borderDim.x, borderDim.y + borderDim.height - CORNER_RADIUS);

			drawRoundedCorners(contentStream, borderDim);

			// Render all the lines
			contentStream.stroke();
		}
		catch (IOException e) {
			log.error("Error processing: drawBorderWithTextGap : {}", e.getMessage());
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_PROCESS_PDF_DOCUMENT);
		}

	}

	private void drawRoundedCorners(PDPageContentStream contentStream, BorderDimensions borderDim) {
		try {
			contentStream.moveTo(borderDim.x, borderDim.y + borderDim.height - CORNER_RADIUS);
			contentStream.curveTo(borderDim.x, borderDim.y + borderDim.height - CORNER_RADIUS / 2,
					borderDim.x + CORNER_RADIUS / 2, borderDim.y + borderDim.height, borderDim.x + CORNER_RADIUS,
					borderDim.y + borderDim.height);

			contentStream.moveTo(borderDim.x + borderDim.width - CORNER_RADIUS, borderDim.y + borderDim.height);
			contentStream.curveTo(borderDim.x + borderDim.width - CORNER_RADIUS / 2, borderDim.y + borderDim.height,
					borderDim.x + borderDim.width, borderDim.y + borderDim.height - CORNER_RADIUS / 2,
					borderDim.x + borderDim.width, borderDim.y + borderDim.height - CORNER_RADIUS);

			contentStream.moveTo(borderDim.x + borderDim.width, borderDim.y + CORNER_RADIUS);
			contentStream.curveTo(borderDim.x + borderDim.width, borderDim.y + CORNER_RADIUS / 2,
					borderDim.x + borderDim.width - CORNER_RADIUS / 2, borderDim.y,
					borderDim.x + borderDim.width - CORNER_RADIUS, borderDim.y);

			contentStream.moveTo(borderDim.x + CORNER_RADIUS, borderDim.y);
			contentStream.curveTo(borderDim.x + CORNER_RADIUS / 2, borderDim.y, borderDim.x,
					borderDim.y + CORNER_RADIUS / 2, borderDim.x, borderDim.y + CORNER_RADIUS);
		}
		catch (IOException e) {
			log.error("Error processing: drawRoundedCorners : {}", e.getMessage());
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_TO_PROCESS_PDF_DOCUMENT);
		}
	}

	private record BorderDimensions(float x, float y, float width, float height) {
	}

	private record TextDimensions(float width, float height) {
	}

	private byte[] renderPageToImage(PDFRenderer pdfRenderer, int pageNumber) throws IOException {
		BufferedImage bim = pdfRenderer.renderImageWithDPI(pageNumber, DPI);
		try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
			ImageIO.write(bim, PNG, baos);
			return baos.toByteArray();
		}
	}

	private List<byte[]> convertPDFPagesToImages(byte[] documentBytes, Integer specificPage) {
		try (RandomAccessReadBuffer randomAccessRead = new RandomAccessReadBuffer(documentBytes);
				PDDocument document = Loader.loadPDF(randomAccessRead)) {

			List<byte[]> imageList = new ArrayList<>();
			PDFRenderer pdfRenderer = new PDFRenderer(document);
			int pageCount = document.getNumberOfPages();

			if (specificPage != null) {
				if (specificPage < 0 || specificPage >= pageCount) {
					throw new ModuleException(
							EsignMessageConstant.ESIGN_ERROR_FAILED_TO_CONVERT_PDF_DOCUMENT_TO_IMAGE_INVALID_PAGE);
				}
				imageList.add(renderPageToImage(pdfRenderer, specificPage));
			}
			else {
				for (int page = 0; page < pageCount; page++) {
					imageList.add(renderPageToImage(pdfRenderer, page));
				}
			}
			return imageList;
		}
		catch (IOException e) {
			log.error("Error converting PDF to image{}: {}", specificPage != null ? "" : " list", e.getMessage(), e);
			throw new ModuleException(
					specificPage != null ? EsignMessageConstant.ESIGN_ERROR_FAILED_TO_CONVERT_PDF_DOCUMENT_TO_IMAGE
							: EsignMessageConstant.ESIGN_ERROR_FAILED_TO_CONVERT_PDF_DOCUMENT_TO_IMAGE_LIST);
		}
	}

	@Override
	public byte[] appendCertificateToPdf(byte[] originalPdfBytes, byte[] certificatePdfBytes) throws IOException {
		log.info("appendCertificateToPdf: execution started");

		if (originalPdfBytes == null || originalPdfBytes.length == 0) {
			throw new IllegalArgumentException(
					messageUtil.getMessage(EsignMessageConstant.ESIGN_VALIDATION_INPUT_STREAM_CANNOT_BE_NULL));
		}

		if (certificatePdfBytes == null || certificatePdfBytes.length == 0) {
			throw new IllegalArgumentException(
					messageUtil.getMessage(EsignMessageConstant.ESIGN_VALIDATION_INPUT_STREAM_CANNOT_BE_NULL));
		}

		try (RandomAccessReadBuffer originalBuffer = new RandomAccessReadBuffer(originalPdfBytes);
				RandomAccessReadBuffer certBuffer = new RandomAccessReadBuffer(certificatePdfBytes);
				PDDocument originalDoc = Loader.loadPDF(originalBuffer);
				PDDocument certDoc = Loader.loadPDF(certBuffer);
				ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

			log.info("Appending {} certificate pages to document with {} pages", certDoc.getNumberOfPages(),
					originalDoc.getNumberOfPages());

			// Import all certificate pages to original document
			for (PDPage page : certDoc.getPages()) {
				originalDoc.importPage(page);
			}

			originalDoc.save(outputStream);
			byte[] mergedPdfBytes = outputStream.toByteArray();

			log.info("appendCertificateToPdf: execution ended successfully");
			return mergedPdfBytes;
		}
	}

	private void drawCheckbox(FieldSignDto field, PDPageContentStream contentStream, float pageHeight,
			PDDocument document) {

		try {

			float width = field.getWidth();
			float height = field.getHeight();

			boolean isChecked = field.isSigned();

			float pixelToPoint = STANDARD_DPI / PDFBOX_DPI;
			float size = Math.min(width, height) * pixelToPoint;

			// Adjust Y position: convert from top-left to bottom-left origin
			float adjustedY = pageHeight - field.getYposition() - size;

			// Adjust X position as before
			float xOffset = DEFAULT_FONT_SIZE * X_OFFSET_VALUE;
			float adjustedX = field.getXposition() + xOffset;

			String basePath = RESOURCE_BASE_PATH + SVG_BASE_PATH;
			// Load appropriate PNG based on state
			String imagePath = isChecked ? basePath + CHECKBOX_CHECKED : basePath + CHECKBOX_UNCHECKED;

			PDImageXObject checkboxImage = pdfResourceCacheService.loadSvgImageAndConvertToPng(document, imagePath,
					width, height, CHECKBOX);

			contentStream.drawImage(checkboxImage, adjustedX, adjustedY, size, size);

		}
		catch (IOException e) {
			log.error("Error drawCheckbox: {}", e.getMessage(), e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_MERGE_TEXT_FILED);
		}
	}

	private void drawRadioButton(FieldSignDto field, PDPageContentStream contentStream, float pageHeight,
			PDDocument document) {

		try {

			float width = field.getWidth();
			float height = field.getHeight();

			boolean isChecked = field.isSigned();

			float pixelToPoint = STANDARD_DPI / PDFBOX_DPI; // 1 px = 0.75 pt
			float size = Math.min(width, height) * pixelToPoint;

			// Adjust Y position: convert from top-left to bottom-left origin
			float adjustedY = pageHeight - field.getYposition() - size;

			// Adjust X position as before
			float xOffset = DEFAULT_FONT_SIZE * X_OFFSET_VALUE;
			float adjustedX = field.getXposition() + xOffset;

			String basePath = RESOURCE_BASE_PATH + SVG_BASE_PATH;

			// Load appropriate PNG based on state
			String imagePath = isChecked ? basePath + RADIO_BUTTON_CHECKED : basePath + RADIO_BUTTON_UNCHECKED;

			PDImageXObject checkboxImage = pdfResourceCacheService.loadSvgImageAndConvertToPng(document, imagePath,
					width, height, RADIO_BUTTON);

			contentStream.drawImage(checkboxImage, adjustedX, adjustedY, size, size);

			String value = field.getFieldValue().trim();

			if (!value.isEmpty()) {
				float textPadding = 4f * pixelToPoint;
				float textX = adjustedX + size + textPadding;
				float textY = adjustedY + (size - DEFAULT_FONT_SIZE) / 2;

				contentStream.beginText();
				contentStream.setFont(loadFont(document), DEFAULT_FONT_SIZE);
				contentStream.setNonStrokingColor(0f, 0f, 0f);
				contentStream.newLineAtOffset(textX, textY);
				contentStream.showText(value);
				contentStream.endText();
			}

		}
		catch (IOException e) {
			log.error("Error drawRadioButton: {}", e.getMessage(), e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_MERGE_TEXT_FILED);
		}
	}

	private void addInputTextField(FieldSignDto field, PDPageContentStream contentStream, float pageHeight,
			PDDocument document) {

		try {
			float pixelToPoint = STANDARD_DPI / PDFBOX_DPI;
			float size = Math.min(field.getWidth(), field.getHeight()) * pixelToPoint;

			float adjustedY = pageHeight - field.getYposition() - size;
			float xOffset = DEFAULT_FONT_SIZE * X_OFFSET_VALUE;
			float adjustedX = field.getXposition() + xOffset;

			FieldSignContainerDto container = field.getFieldSignContainer();

			String fontFamily = container != null ? container.getFontFamily() : null;
			String fontColor = container != null && container.getFontColor() != null ? container.getFontColor() : null;
			float fontSize = container != null ? container.getFontSize() : DEFAULT_FONT_SIZE;
			boolean isBold = container != null && Boolean.TRUE.equals(container.getIsBold());
			boolean isItalic = container != null && Boolean.TRUE.equals(container.getIsItalic());
			boolean isUnderline = container != null && Boolean.TRUE.equals(container.getIsUnderline());

			float fontSizeToUse = fontSize > 0 ? fontSize : DEFAULT_FONT_SIZE;

			PDType0Font font;

			if (fontFamily == null || fontColor == null) {
				font = loadDefaultFont(document);
				contentStream.setFont(font, fontSizeToUse);
				contentStream.setNonStrokingColor(TEXT_COLOR.getRed() / COLOR_NORMALIZATION_FACTOR,
						TEXT_COLOR.getGreen() / COLOR_NORMALIZATION_FACTOR,
						TEXT_COLOR.getBlue() / COLOR_NORMALIZATION_FACTOR);
			}
			else {
				font = loadFontWithStyle(document, fontFamily, isBold, isItalic);
				Color color = Color.decode(fontColor);
				contentStream.setFont(font, fontSizeToUse);
				contentStream.setNonStrokingColor(color.getRed() / COLOR_NORMALIZATION_FACTOR,
						color.getGreen() / COLOR_NORMALIZATION_FACTOR, color.getBlue() / COLOR_NORMALIZATION_FACTOR);
			}

			contentStream.beginText();
			contentStream.newLineAtOffset(adjustedX, adjustedY);
			contentStream.showText(field.getFieldValue());
			contentStream.endText();

			if (isUnderline) {
				Color underlineColor = fontColor != null ? Color.decode(fontColor) : TEXT_COLOR;
				contentStream.setStrokingColor(underlineColor.getRed() / COLOR_NORMALIZATION_FACTOR,
						underlineColor.getGreen() / COLOR_NORMALIZATION_FACTOR,
						underlineColor.getBlue() / COLOR_NORMALIZATION_FACTOR);
				float textWidth = font.getStringWidth(field.getFieldValue()) / GLYPH_TO_EM_UNIT * fontSizeToUse;
				float underlineY = adjustedY - UNDERLINE_OFFSET;
				contentStream.moveTo(adjustedX, underlineY);
				contentStream.lineTo(adjustedX + textWidth, underlineY);
				contentStream.setLineWidth(UNDERLINE_THICKNESS);
				contentStream.stroke();
			}

		}
		catch (Exception e) {
			log.error("Error rendering text field to PDF", e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_MERGE_TEXT_FILED);
		}
	}

	private String determineVariant(String folderName, boolean isBold, boolean isItalic) {
		// Handle Noto Sans JP (no italic variants)
		if (NOTO_SANS_JP.equals(folderName) && isItalic) {
			return FontVariantType.fromFlags(isBold, false).getVariantName();
		}
		// Standard variant determination
		return FontVariantType.fromFlags(isBold, isItalic).getVariantName();
	}

	private String buildFilename(String folderName, String variant) {
		FontVariantType variantType = FontVariantType.fromString(variant);

		// DejaVu Sans uses "Oblique" instead of "Italic"
		if (DEJAVU_SANS.equals(folderName)) {
			return DEJAVU_SANS_VARIANT_MAP.getOrDefault(variantType, DEJAVU_SANS + TFF_FILE);
		}

		// Standard naming: FolderName-Variant.ttf
		return folderName + "-" + variantType.getVariantName() + TFF_FILE;
	}

	private PDType0Font loadDefaultFont(PDDocument document) {
		return loadFont(document);
	}

	private PDType0Font loadFontWithStyle(PDDocument document, String fontFamily, boolean isBold, boolean isItalic) {
		String normalizedFamily = fontFamily != null ? fontFamily.toLowerCase().trim() : "";
		String folderName = EsignFontFamilyType.getFolderByFamily(normalizedFamily);
		return loadFontFromRelativePath(document, folderName, isBold, isItalic);
	}

	private PDType0Font loadFontFromRelativePath(PDDocument document, String folderName, boolean isBold,
			boolean isItalic) {

		if (folderName == null || folderName.isEmpty()) {
			log.warn("Font family not recognized, falling back to document font");
			return loadFont(document);

		}

		String variant = determineVariant(folderName, isBold, isItalic);
		String filename = buildFilename(folderName, variant);
		String path = RESOURCE_BASE_PATH + FONT_BASE_PATH + folderName + "/" + filename;

		PDType0Font font;
		try {
			font = pdfResourceCacheService.loadFont(document, path);
		}
		catch (Exception e) {
			log.warn("Font not found '{}', falling back to document font: {}", path, e.getMessage());
			// if an error occurs when downloading font file from S3/cache fallback to
			// document font loading
			font = loadFont(document);
		}
		return font;
	}

}
