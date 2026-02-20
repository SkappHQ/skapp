package com.skapp.enterprise.esignature.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.font.PDType0Font;

public interface PDFFontCacheService {

	PDType0Font loadFont(PDDocument document, String relativePath);

}
