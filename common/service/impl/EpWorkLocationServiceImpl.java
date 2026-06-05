package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.WorkLocation;
import com.skapp.community.common.payload.request.WorkLocationGeofenceRequestDto;
import com.skapp.community.common.payload.request.WorkLocationRequestDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.payload.response.WorkLocationDetailResponseDto;
import com.skapp.community.common.payload.response.WorkLocationGeofenceResponseDto;
import com.skapp.community.common.repository.WorkLocationDao;
import com.skapp.community.common.service.impl.WorkLocationServiceImpl;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.timeplanner.model.TimeRecord;
import com.skapp.community.timeplanner.repository.TimeRecordDao;
import com.skapp.enterprise.timeplanner.model.WorkLocationGeofence;
import com.skapp.enterprise.timeplanner.repository.TimeRecordLocationDao;
import com.skapp.enterprise.timeplanner.repository.WorkLocationGeofenceDao;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Primary
@Service
@Slf4j
public class EpWorkLocationServiceImpl extends WorkLocationServiceImpl {

	private final WorkLocationDao workLocationDao;

	private final WorkLocationGeofenceDao workLocationGeofenceDao;

	private final EmployeeDao employeeDao;

	private final TimeRecordDao timeRecordDao;

	private final TimeRecordLocationDao timeRecordLocationDao;

	public EpWorkLocationServiceImpl(WorkLocationDao workLocationDao, EmployeeDao employeeDao, MessageUtil messageUtil,
			WorkLocationGeofenceDao workLocationGeofenceDao, TimeRecordDao timeRecordDao,
			TimeRecordLocationDao timeRecordLocationDao) {
		super(workLocationDao, employeeDao, messageUtil);
		this.workLocationDao = workLocationDao;
		this.workLocationGeofenceDao = workLocationGeofenceDao;
		this.employeeDao = employeeDao;
		this.timeRecordDao = timeRecordDao;
		this.timeRecordLocationDao = timeRecordLocationDao;
	}

	@Override
	@Transactional
	public ResponseEntityDto createWorkLocation(WorkLocationRequestDto workLocationRequestDto) {
		log.info("EpWorkLocationServiceImpl createWorkLocation: execution started");
		ResponseEntityDto result = super.createWorkLocation(workLocationRequestDto);
		if (workLocationRequestDto.getGeofence() != null) {
			WorkLocation workLocation = workLocationDao.findByNameIgnoreCase(workLocationRequestDto.getName())
				.orElseThrow(() -> new ModuleException(CommonMessageConstant.COMMON_ERROR_WORK_LOCATION_NOT_FOUND));
			WorkLocationGeofence geofence = buildGeofence(workLocation, workLocationRequestDto.getGeofence());
			workLocationGeofenceDao.save(geofence);
		}
		log.info("EpWorkLocationServiceImpl createWorkLocation: execution ended");
		return result;
	}

	@Override
	@Transactional
	public ResponseEntityDto updateWorkLocation(Long id, WorkLocationRequestDto workLocationRequestDto) {
		log.info("EpWorkLocationServiceImpl updateWorkLocation: execution started");
		ResponseEntityDto result = super.updateWorkLocation(id, workLocationRequestDto);
		if (workLocationRequestDto.getGeofence() != null) {
			WorkLocation workLocation = workLocationDao.findById(id)
				.orElseThrow(() -> new ModuleException(CommonMessageConstant.COMMON_ERROR_WORK_LOCATION_NOT_FOUND));
			Optional<WorkLocationGeofence> existing = workLocationGeofenceDao.findByWorkLocationWorkLocationId(id);
			WorkLocationGeofence geofence = existing.orElseGet(WorkLocationGeofence::new);
			geofence.setWorkLocation(workLocation);
			geofence.setLatitude(workLocationRequestDto.getGeofence().getLatitude());
			geofence.setLongitude(workLocationRequestDto.getGeofence().getLongitude());
			geofence.setRadiusMeters(workLocationRequestDto.getGeofence().getRadiusMeters());
			workLocationGeofenceDao.save(geofence);
			clearTimeRecordLocationsForWorkLocation(id);
		}
		else {
			workLocationGeofenceDao.findByWorkLocationWorkLocationId(id).ifPresent(existingGeofence -> {
				clearTimeRecordLocationsForWorkLocation(id);
				workLocationGeofenceDao.delete(existingGeofence);
			});
		}
		log.info("EpWorkLocationServiceImpl updateWorkLocation: execution ended");
		return result;
	}

	@Override
	@Transactional
	public ResponseEntityDto deleteWorkLocation(Long id) {
		log.info("EpWorkLocationServiceImpl deleteWorkLocation: execution started");
		workLocationGeofenceDao.findByWorkLocationWorkLocationId(id).ifPresent(existingGeofence -> {
			clearTimeRecordLocationsForWorkLocation(id);
			workLocationGeofenceDao.delete(existingGeofence);
		});
		ResponseEntityDto result = super.deleteWorkLocation(id);
		log.info("EpWorkLocationServiceImpl deleteWorkLocation: execution ended");
		return result;
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getWorkLocationById(Long id) {
		log.info("EpWorkLocationServiceImpl getWorkLocationById: execution started");
		ResponseEntityDto response = super.getWorkLocationById(id);
		Optional<WorkLocationGeofence> geofence = workLocationGeofenceDao.findByWorkLocationWorkLocationId(id);
		if (!response.getResults().isEmpty()
				&& response.getResults().get(0) instanceof WorkLocationDetailResponseDto detailDto) {
			detailDto.setGeofence(geofence.map(g -> {
				WorkLocationGeofenceResponseDto geoDto = new WorkLocationGeofenceResponseDto();
				geoDto.setId(g.getId());
				geoDto.setLatitude(g.getLatitude());
				geoDto.setLongitude(g.getLongitude());
				geoDto.setRadiusMeters(g.getRadiusMeters());
				return geoDto;
			}).orElse(null));
		}
		log.info("EpWorkLocationServiceImpl getWorkLocationById: execution ended");
		return response;
	}

	private void clearTimeRecordLocationsForWorkLocation(Long workLocationId) {
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
			log.info(
					"clearTimeRecordLocationsForWorkLocation: deleted time record location indicators for work location");
		}
	}

	private WorkLocationGeofence buildGeofence(WorkLocation workLocation, WorkLocationGeofenceRequestDto dto) {
		WorkLocationGeofence geofence = new WorkLocationGeofence();
		geofence.setWorkLocation(workLocation);
		geofence.setLatitude(dto.getLatitude());
		geofence.setLongitude(dto.getLongitude());
		geofence.setRadiusMeters(dto.getRadiusMeters());
		return geofence;
	}

}
