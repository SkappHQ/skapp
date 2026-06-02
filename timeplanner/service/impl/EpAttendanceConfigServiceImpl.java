package com.skapp.enterprise.timeplanner.service.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.WorkLocationDao;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.timeplanner.model.AttendanceConfig;
import com.skapp.community.timeplanner.payload.request.AttendanceConfigRequestDto;
import com.skapp.community.timeplanner.repository.AttendanceConfigDao;
import com.skapp.community.timeplanner.service.impl.AttendanceConfigServiceImpl;
import com.skapp.community.timeplanner.type.AttendanceConfigType;
import com.skapp.enterprise.timeplanner.repository.EpWorkLocationRepository;
import com.skapp.enterprise.timeplanner.repository.WorkLocationGeofenceDao;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Primary
@Service
@Slf4j
public class EpAttendanceConfigServiceImpl extends AttendanceConfigServiceImpl {

	private final AttendanceConfigDao attendanceConfigDao;

	private final WorkLocationGeofenceDao workLocationGeofenceDao;

	private final EpWorkLocationRepository epWorkLocationRepository;

	public EpAttendanceConfigServiceImpl(AttendanceConfigDao attendanceConfigDao, MessageUtil messageUtil,
			UserService userService, WorkLocationGeofenceDao workLocationGeofenceDao,
			EpWorkLocationRepository epWorkLocationRepository) {
		super(attendanceConfigDao, messageUtil, userService);
		this.attendanceConfigDao = attendanceConfigDao;
		this.workLocationGeofenceDao = workLocationGeofenceDao;
		this.epWorkLocationRepository = epWorkLocationRepository;
	}

	@Override
	@Transactional
	public ResponseEntityDto updateAttendanceConfig(AttendanceConfigRequestDto attendanceConfigRequestDto) {
		log.info("EpAttendanceConfigServiceImpl updateAttendanceConfig: execution started");

		boolean wasGeoFencingEnabled = false;
		if (Boolean.FALSE.equals(attendanceConfigRequestDto.getIsGeoFencingEnabled())) {
			AttendanceConfig geoConfig = attendanceConfigDao
				.findByAttendanceConfigType(AttendanceConfigType.GEO_FENCING_ENABLED);
			wasGeoFencingEnabled = geoConfig != null && Boolean.parseBoolean(geoConfig.getAttendanceConfigValue());
		}

		ResponseEntityDto result = super.updateAttendanceConfig(attendanceConfigRequestDto);

		if (wasGeoFencingEnabled) {
			epWorkLocationRepository.clearAddressesForGeofencedLocations();
			workLocationGeofenceDao.deleteAllInBatch();
			log.info(
					"EpAttendanceConfigServiceImpl updateAttendanceConfig: geo-fencing disabled, cleared addresses and removed all geofence sites");
		}

		log.info("EpAttendanceConfigServiceImpl updateAttendanceConfig: execution ended");
		return result;
	}

}
