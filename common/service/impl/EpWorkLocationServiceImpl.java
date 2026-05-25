package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.repository.WorkLocationDao;
import com.skapp.community.common.repository.WorkLocationGeofenceDao;
import com.skapp.community.common.service.impl.WorkLocationServiceImpl;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.enterprise.timeplanner.repository.TimeRecordLocationDao;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

@Primary
@Service
@Slf4j
public class EpWorkLocationServiceImpl extends WorkLocationServiceImpl {

	private final TimeRecordLocationDao timeRecordLocationDao;

	public EpWorkLocationServiceImpl(WorkLocationDao workLocationDao, WorkLocationGeofenceDao workLocationGeofenceDao,
			EmployeeDao employeeDao, MessageUtil messageUtil, TimeRecordLocationDao timeRecordLocationDao) {
		super(workLocationDao, workLocationGeofenceDao, employeeDao, messageUtil);
		this.timeRecordLocationDao = timeRecordLocationDao;
	}

	@Override
	protected void onGeofenceRemovedOrUpdated(Long workLocationId) {
		timeRecordLocationDao.deleteByWorkLocationId(workLocationId);
		log.info("onGeofenceRemovedOrUpdated: deleted time record location indicators for work location {}",
				workLocationId);
	}

}
