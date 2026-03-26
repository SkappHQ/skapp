package com.skapp.enterprise.esignature.service;

import com.skapp.enterprise.esignature.payload.response.RepairJobDto;
import com.skapp.enterprise.esignature.service.impl.RepairJobTracker;

import java.time.LocalDate;

public interface EsMigrationDocumentRepairAsyncService {

	void repairDocumentHashesAsync(LocalDate startDate, RepairJobDto job, RepairJobTracker repairJobTracker);

}
