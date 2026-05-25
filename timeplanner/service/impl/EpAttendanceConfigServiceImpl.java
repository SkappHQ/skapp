package com.skapp.enterprise.timeplanner.service.impl;

import com.skapp.community.common.repository.WorkLocationDao;
import com.skapp.community.common.repository.WorkLocationGeofenceDao;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.timeplanner.repository.AttendanceConfigDao;
import com.skapp.community.timeplanner.service.impl.AttendanceConfigServiceImpl;
import com.skapp.enterprise.timeplanner.repository.TimeRecordLocationDao;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

@Primary
@Service
@Slf4j
public class EpAttendanceConfigServiceImpl extends AttendanceConfigServiceImpl {

	private final TimeRecordLocationDao timeRecordLocationDao;

	public EpAttendanceConfigServiceImpl(AttendanceConfigDao attendanceConfigDao,
			WorkLocationGeofenceDao workLocationGeofenceDao, WorkLocationDao workLocationDao, MessageUtil messageUtil,
			UserService userService, TimeRecordLocationDao timeRecordLocationDao) {
		super(attendanceConfigDao, workLocationGeofenceDao, workLocationDao, messageUtil, userService);
		this.timeRecordLocationDao = timeRecordLocationDao;
	}

	@Override
	protected void onGeoFencingDisabled() {
		timeRecordLocationDao.deleteAllInBatch();
		log.info("onGeoFencingDisabled: deleted all time record location indicators");
	}

}
