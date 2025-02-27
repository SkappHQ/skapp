package com.skapp.enterprise.esignature.service;

import com.skapp.enterprise.esignature.payload.request.FieldSignDto;

import java.util.List;

public interface DocumentProcessingService {

	byte[] mergeFields(List<FieldSignDto> fieldSignDtoList, byte[] inputBytes);

}
