package com.skapp.enterprise.esignature.service;

import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.payload.response.DocumentHashRepairResponseDto;

public interface EsMigrationDocumentRepairService {

	void repairDocument(Envelope envelope, Document document, DocumentHashRepairResponseDto response);

}
