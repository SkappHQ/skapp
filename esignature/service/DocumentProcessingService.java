package com.skapp.enterprise.esignature.service;

import com.skapp.enterprise.esignature.payload.request.FieldSignDto;

import java.io.InputStream;
import java.util.List;

public interface DocumentProcessingService {

	InputStream mergeFields(List<FieldSignDto> fieldSignDtoList, InputStream inputStream);

}
