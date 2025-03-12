package com.skapp.enterprise.people.service.impl;

import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.payload.response.EmployeeBulkResponseDto;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.type.BulkItemStatus;
import com.skapp.enterprise.people.service.EpEmployeeTimelineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class EpAsyncEmployeeTimelineServiceImpl {

	private final EmployeeDao employeeDao;

	private final EpEmployeeTimelineService epEmployeeTimelineService;

	@Async
	public void addNewBulkUploadedEmployeeTimeLineRecordsInBackground(List<EmployeeBulkResponseDto> results) {
		int batchSize = 100;

		List<List<EmployeeBulkResponseDto>> batches = createBatches(results, batchSize);

		for (List<EmployeeBulkResponseDto> batch : batches) {
			processBatch(batch);
		}
	}

	private List<List<EmployeeBulkResponseDto>> createBatches(List<EmployeeBulkResponseDto> results, int batchSize) {
		return new ArrayList<>(results.stream()
			.filter(result -> result.getStatus() == BulkItemStatus.SUCCESS)
			.collect(Collectors.groupingBy(result -> results.indexOf(result) / batchSize))
			.values());
	}

	private void processBatch(List<EmployeeBulkResponseDto> batch) {
		batch.forEach(result -> {
			try {
				Employee employee = employeeDao.findEmployeeByEmail(result.getEmail());
				epEmployeeTimelineService.addNewEmployeeTimeLineRecordForBulk(employee);
				log.info("Email sent successfully to: {}", result.getEmail());
			}
			catch (Exception exception) {
				log.error("Failed to send email to: {}", result.getEmail(), exception);
			}
		});
	}

}
