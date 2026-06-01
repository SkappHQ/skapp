package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.repository.WorkLocationDao;
import com.skapp.community.common.repository.WorkLocationGeofenceDao;
import com.skapp.community.common.service.impl.WorkLocationServiceImpl;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.timeplanner.model.TimeRecord;
import com.skapp.community.timeplanner.repository.TimeRecordDao;
import com.skapp.enterprise.timeplanner.repository.TimeRecordLocationDao;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.List;

@Primary
@Service
@Slf4j
public class EpWorkLocationServiceImpl extends WorkLocationServiceImpl {

	private final TimeRecordDao timeRecordDao;

	private final TimeRecordLocationDao timeRecordLocationDao;

	public EpWorkLocationServiceImpl(WorkLocationDao workLocationDao, WorkLocationGeofenceDao workLocationGeofenceDao,
			EmployeeDao employeeDao, MessageUtil messageUtil, TimeRecordDao timeRecordDao,
			TimeRecordLocationDao timeRecordLocationDao) {
		super(workLocationDao, workLocationGeofenceDao, employeeDao, messageUtil);
		this.timeRecordDao = timeRecordDao;
		this.timeRecordLocationDao = timeRecordLocationDao;
	}

	@Override
	protected void onGeofenceRemovedOrUpdated(Long workLocationId) {
		List<Long> employeeIds = employeeDao.findByWorkLocationWorkLocationId(workLocationId)
			.stream()
			.map(Employee::getEmployeeId)
			.toList();

		if (employeeIds.isEmpty()) {
			return;
		}

		List<Long> timeRecordIds = timeRecordDao.findByEmployeeEmployeeIdIn(employeeIds)
			.stream()
			.map(TimeRecord::getTimeRecordId)
			.toList();

		if (!timeRecordIds.isEmpty()) {
			timeRecordLocationDao.deleteAllByTimeRecordTimeRecordIdIn(timeRecordIds);
			log.info("onGeofenceRemovedOrUpdated: deleted time record location indicators for work location");
		}
	}

}
