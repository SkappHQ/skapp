package com.skapp.enterprise.esignature.service;

import com.skapp.enterprise.esignature.payload.request.FieldSignDto;

public interface DocumentProcessingService {

	byte[] mergeTextFieldToDocument(FieldSignDto fieldSignDto, byte[] inputBytes);

	byte[] updateEnvelopeUuidToEachPage(String value, byte[] inputBytes, int numOfPages);

	byte[] mergeImageFieldToDocument(FieldSignDto fieldSignDto, byte[] inputBytes, byte[] imageBytes);

	int getNumberOfPages(byte[] inputBytes);

}
