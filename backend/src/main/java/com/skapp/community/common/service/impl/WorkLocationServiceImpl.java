package com.skapp.community.common.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.payload.response.WorkLocationDetailResponseDto;
import com.skapp.community.common.payload.response.WorkLocationEmployeeResponseDto;
import com.skapp.community.common.payload.response.WorkLocationGeofenceResponseDto;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.model.WorkLocation;
import com.skapp.community.common.model.WorkLocationGeofence;
import com.skapp.community.common.payload.request.WorkLocationFilterDto;
import com.skapp.community.common.payload.request.WorkLocationRequestDto;
import com.skapp.community.common.payload.response.WorkLocationResponseDto;
import com.skapp.community.common.repository.WorkLocationDao;
import com.skapp.community.common.repository.WorkLocationGeofenceDao;
import com.skapp.community.common.service.WorkLocationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class WorkLocationServiceImpl implements WorkLocationService {

	private final WorkLocationDao workLocationDao;

	private final WorkLocationGeofenceDao workLocationGeofenceDao;

	private final EmployeeDao employeeDao;

	private final MessageUtil messageUtil;

	@Override
	@Transactional
	public ResponseEntityDto createWorkLocation(WorkLocationRequestDto workLocationRequestDto) {
		log.info("createWorkLocation: execution started");

		String workLocationName = workLocationRequestDto.getName();

		if (Boolean.TRUE.equals(workLocationRequestDto.getIsAllEmployees())
				&& workLocationRequestDto.getEmployeeIds() != null
				&& !workLocationRequestDto.getEmployeeIds().isEmpty()) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_WORK_LOCATION_EMPLOYEE_ASSIGNMENT_CONFLICT);
		}

		if (workLocationDao.existsByNameIgnoreCase(workLocationName)) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_WORK_LOCATION_NAME_ALREADY_EXISTS);
		}

		WorkLocation workLocation = new WorkLocation();
		workLocation.setName(workLocationName);
		workLocation.setAddress(workLocationRequestDto.getAddress());
		workLocation = workLocationDao.save(workLocation);

		WorkLocationGeofence savedGeofence = null;
		if (workLocationRequestDto.getGeofence() != null) {
			WorkLocationGeofence geofence = createGeofence(workLocationRequestDto, workLocation);
			savedGeofence = workLocationGeofenceDao.save(geofence);
		}

		assignEmployeesToWorkLocation(workLocationRequestDto, workLocation);

		log.info("createWorkLocation: execution ended");

		return new ResponseEntityDto(messageUtil.getMessage(CommonMessageConstant.COMMON_SUCCESS_WORK_LOCATION_CREATED),
				false);
	}

	@Override
	@Transactional
	public ResponseEntityDto updateWorkLocation(Long id, WorkLocationRequestDto workLocationRequestDto) {
		log.info("updateWorkLocation: execution started");

		WorkLocation workLocation = workLocationDao.findById(id)
			.orElseThrow(() -> new ModuleException(CommonMessageConstant.COMMON_ERROR_WORK_LOCATION_NOT_FOUND));

		if (Boolean.TRUE.equals(workLocationRequestDto.getIsAllEmployees())
				&& workLocationRequestDto.getEmployeeIds() != null
				&& !workLocationRequestDto.getEmployeeIds().isEmpty()) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_WORK_LOCATION_EMPLOYEE_ASSIGNMENT_CONFLICT);
		}

		String workLocationName = workLocationRequestDto.getName() != null ? workLocationRequestDto.getName() : null;

		if (workLocationName != null
				&& workLocationDao.existsByNameIgnoreCaseAndWorkLocationIdNot(workLocationName, id)) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_WORK_LOCATION_NAME_ALREADY_EXISTS);
		}

		if (workLocationName != null) {
			workLocation.setName(workLocationName);
		}

		if (workLocationRequestDto.getAddress() != null) {
			workLocation.setAddress(workLocationRequestDto.getAddress());
		}

		clearWorkLocationFromEmployees(id);
		assignEmployeesToWorkLocation(workLocationRequestDto, workLocation);

		WorkLocationGeofence updatedGeofence = null;
		if (workLocationRequestDto.getGeofence() != null) {
			Optional<WorkLocationGeofence> existingGeofence = workLocationGeofenceDao
				.findByWorkLocationWorkLocationId(id);
			WorkLocationGeofence geofence = existingGeofence.orElseGet(WorkLocationGeofence::new);
			geofence.setWorkLocation(workLocation);
			geofence.setLatitude(workLocationRequestDto.getGeofence().getLatitude());
			geofence.setLongitude(workLocationRequestDto.getGeofence().getLongitude());
			geofence.setRadiusMeters(workLocationRequestDto.getGeofence().getRadiusMeters());
			updatedGeofence = workLocationGeofenceDao.save(geofence);
		}
		else {
			workLocationGeofenceDao.findByWorkLocationWorkLocationId(id).ifPresent(workLocationGeofenceDao::delete);
		}

		workLocation = workLocationDao.save(workLocation);

		log.info("updateWorkLocation: execution ended");

		return new ResponseEntityDto(messageUtil.getMessage(CommonMessageConstant.COMMON_SUCCESS_WORK_LOCATION_UPDATED),
				false);
	}

	@Override
	@Transactional
	public ResponseEntityDto deleteWorkLocation(Long id) {
		log.info("deleteWorkLocation: execution started");

		WorkLocation workLocation = workLocationDao.findById(id)
			.orElseThrow(() -> new ModuleException(CommonMessageConstant.COMMON_ERROR_WORK_LOCATION_NOT_FOUND));

		clearWorkLocationFromEmployees(id);
		workLocationGeofenceDao.findByWorkLocationWorkLocationId(id).ifPresent(workLocationGeofenceDao::delete);
		workLocationDao.delete(workLocation);

		log.info("deleteWorkLocation: execution ended");

		return new ResponseEntityDto(messageUtil.getMessage(CommonMessageConstant.COMMON_SUCCESS_WORK_LOCATION_DELETED),
				false);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getWorkLocations(WorkLocationFilterDto workLocationFilterDto) {
		log.info("getWorkLocations: execution started");

		Pageable pageable = PageRequest.of(workLocationFilterDto.getPage(), workLocationFilterDto.getSize());
		Page<WorkLocation> workLocationPage = workLocationDao.findWorkLocations(workLocationFilterDto, pageable);

		List<Long> workLocationIds = workLocationPage.getContent()
			.stream()
			.map(WorkLocation::getWorkLocationId)
			.toList();

		Map<Long, Long> employeeCountByWorkLocationId = employeeDao.countByWorkLocationIds(workLocationIds);

		List<WorkLocationResponseDto> workLocationResponseDtos = workLocationPage.getContent()
			.stream()
			.map(wl -> mapWorkLocationToResponseDto(wl,
					employeeCountByWorkLocationId.getOrDefault(wl.getWorkLocationId(), 0L)))
			.toList();

		PageDto pageDto = new PageDto();
		pageDto.setItems(workLocationResponseDtos);
		pageDto.setCurrentPage(workLocationPage.getNumber());
		pageDto.setTotalItems(workLocationPage.getTotalElements());
		pageDto.setTotalPages(workLocationPage.getTotalPages());

		log.info("getWorkLocations: execution ended");

		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getWorkLocationById(Long id) {
		log.info("getWorkLocationById: execution started");

		WorkLocation workLocation = workLocationDao.findById(id)
			.orElseThrow(() -> new ModuleException(CommonMessageConstant.COMMON_ERROR_WORK_LOCATION_NOT_FOUND));

		List<Employee> employees = employeeDao.findByWorkLocationWorkLocationId(id);
		Optional<WorkLocationGeofence> geofence = workLocationGeofenceDao.findByWorkLocationWorkLocationId(id);

		List<Employee> allActiveEmployees = employeeDao
			.findByAccountStatusIn(Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING));
		boolean isAllEmployees = !employees.isEmpty() && employees.size() == allActiveEmployees.size();

		WorkLocationDetailResponseDto responseDto = new WorkLocationDetailResponseDto();
		responseDto.setWorkLocationId(workLocation.getWorkLocationId());
		responseDto.setName(workLocation.getName());
		responseDto.setAddress(workLocation.getAddress());
		responseDto.setEmployeeCount((long) employees.size());
		responseDto.setIsAllEmployees(isAllEmployees);
		responseDto.setEmployees(isAllEmployees ? null : employees.stream().map(emp -> {
			WorkLocationEmployeeResponseDto empDto = new WorkLocationEmployeeResponseDto();
			empDto.setEmployeeId(emp.getEmployeeId());
			empDto.setFirstName(emp.getFirstName());
			empDto.setLastName(emp.getLastName());
			empDto.setAuthPic(emp.getAuthPic());
			return empDto;
		}).toList());
		responseDto.setGeofence(geofence.map(g -> {
			WorkLocationGeofenceResponseDto geoDto = new WorkLocationGeofenceResponseDto();
			geoDto.setId(g.getId());
			geoDto.setLatitude(g.getLatitude());
			geoDto.setLongitude(g.getLongitude());
			geoDto.setRadiusMeters(g.getRadiusMeters());
			return geoDto;
		}).orElse(null));

		log.info("getWorkLocationById: execution ended");

		return new ResponseEntityDto(false, responseDto);
	}

	private WorkLocationGeofence createGeofence(WorkLocationRequestDto workLocationRequestDto,
			WorkLocation workLocation) {
		WorkLocationGeofence geofence = new WorkLocationGeofence();
		geofence.setWorkLocation(workLocation);
		geofence.setLatitude(workLocationRequestDto.getGeofence().getLatitude());
		geofence.setLongitude(workLocationRequestDto.getGeofence().getLongitude());
		geofence.setRadiusMeters(workLocationRequestDto.getGeofence().getRadiusMeters());
		return geofence;
	}

	private WorkLocationResponseDto mapWorkLocationToResponseDto(WorkLocation workLocation, Long employeeCount) {
		WorkLocationResponseDto workLocationResponseDto = new WorkLocationResponseDto();
		workLocationResponseDto.setWorkLocationId(workLocation.getWorkLocationId());
		workLocationResponseDto.setName(workLocation.getName());
		workLocationResponseDto.setAddress(workLocation.getAddress());
		workLocationResponseDto.setEmployeeCount(employeeCount);
		return workLocationResponseDto;
	}

	private void assignEmployeesToWorkLocation(WorkLocationRequestDto requestDto, WorkLocation workLocation) {
		if (Boolean.TRUE.equals(requestDto.getIsAllEmployees())) {
			List<Employee> allActiveEmployees = employeeDao
				.findByAccountStatusIn(Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING));
			for (Employee employee : allActiveEmployees) {
				employee.setWorkLocation(workLocation);
			}
			employeeDao.saveAll(allActiveEmployees);
		}
		else if (requestDto.getEmployeeIds() != null && !requestDto.getEmployeeIds().isEmpty()) {
			List<Employee> employees = employeeDao.findAllById(requestDto.getEmployeeIds());
			for (Employee employee : employees) {
				employee.setWorkLocation(workLocation);
			}
			employeeDao.saveAll(employees);
		}
	}

	private void clearWorkLocationFromEmployees(Long workLocationId) {
		List<Employee> employees = employeeDao.findByWorkLocationWorkLocationId(workLocationId);
		for (Employee employee : employees) {
			employee.setWorkLocation(null);
		}
		employeeDao.saveAll(employees);
	}

}
