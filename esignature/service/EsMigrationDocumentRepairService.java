package com.skapp.enterprise.esignature.service;

import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.payload.response.DocumentHashRepairResponseDto;
import com.skapp.enterprise.esignature.payload.response.RepairJobDto;

import java.time.LocalDate;

public interface EsMigrationDocumentRepairService {

	void repairDocument(LocalDate startDate, RepairJobDto job);

	RepairJobDto getRepairJobStatus(String jobId);

}
