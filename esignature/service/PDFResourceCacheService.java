package com.skapp.enterprise.esignature.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;

public interface PDFResourceCacheService {

	PDType0Font loadFont(PDDocument document, String path);

	PDImageXObject loadSvgImageAndConvertToPng(PDDocument document, String path, float width, float height,
			String name);

}
