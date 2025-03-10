package com.skapp.enterprise.esignature.service;

import com.skapp.enterprise.esignature.payload.request.FieldSignDto;

public interface DocumentProcessingService {

	byte[] mergeTextFieldToDocument(FieldSignDto fieldSignDto, byte[] inputBytes);

	byte[] mergeImageFieldToDocument(FieldSignDto fieldSignDto, byte[] inputBytes, byte[] imageBytes);

}
