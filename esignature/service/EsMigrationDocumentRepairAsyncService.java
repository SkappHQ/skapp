package com.skapp.enterprise.esignature.service;

import com.skapp.enterprise.esignature.payload.response.RepairJobDto;

import java.time.LocalDate;

public interface EsMigrationDocumentRepairAsyncService {

	void repairDocumentHashesAsync(LocalDate startDate, RepairJobDto job);

}
