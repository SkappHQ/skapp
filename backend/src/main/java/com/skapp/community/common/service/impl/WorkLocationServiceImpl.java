package com.skapp.community.common.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.payload.response.WorkLocationDetailResponseDto;
import com.skapp.community.common.payload.response.WorkLocationEmployeeResponseDto;
import com.skapp.community.common.payload.response.WorkLocationGeofenceResponseDto;
import com.skapp.community.common.payload.response.WorkLocationNameAvailabilityResponseDto;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.community.common.constant.CommonConstants;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.model.WorkLocation;
import com.skapp.community.common.model.WorkLocationGeofence;
import com.skapp.community.common.payload.request.WorkLocationFilterDto;
import com.skapp.community.common.payload.request.WorkLocationRequestDto;
import com.skapp.community.common.payload.response.WorkLocationResponseDto;
import com.skapp.community.common.payload.response.WorkLocationSummaryResponseDto;
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

		if (workLocationDao.existsByNameIgnoreCase(workLocationName)) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_WORK_LOCATION_NAME_ALREADY_EXISTS);
		}

		WorkLocation workLocation = new WorkLocation();
		workLocation.setName(workLocationName);
		workLocation.setAddress(workLocationRequestDto.getAddress());
		workLocation = workLocationDao.save(workLocation);

		if (workLocationRequestDto.getGeofence() != null) {
			WorkLocationGeofence geofence = createGeofence(workLocationRequestDto, workLocation);
			workLocationGeofenceDao.save(geofence);
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

		String workLocationName = workLocationRequestDto.getName();

		if (workLocationName != null && !workLocationName.equalsIgnoreCase(workLocation.getName())
				&& workLocationDao.existsByNameIgnoreCase(workLocationName)) {
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

		if (workLocationRequestDto.getGeofence() != null) {
			Optional<WorkLocationGeofence> existingGeofence = workLocationGeofenceDao
				.findByWorkLocationWorkLocationId(id);
			WorkLocationGeofence geofence = existingGeofence.orElseGet(WorkLocationGeofence::new);
			geofence.setWorkLocation(workLocation);
			geofence.setLatitude(workLocationRequestDto.getGeofence().getLatitude());
			geofence.setLongitude(workLocationRequestDto.getGeofence().getLongitude());
			geofence.setRadiusMeters(workLocationRequestDto.getGeofence().getRadiusMeters());
			workLocationGeofenceDao.save(geofence);
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
	public ResponseEntityDto getAllWorkLocations() {
		log.info("getAllWorkLocations: execution started");

		List<WorkLocation> workLocations = workLocationDao.findAllWorkLocationsOrderByNameAsc();

		List<WorkLocationSummaryResponseDto> workLocationResponseDtos = workLocations.stream()
			.map(this::mapWorkLocationToSummaryResponseDto)
			.toList();

		log.info("getAllWorkLocations: execution ended");

		return new ResponseEntityDto(false, workLocationResponseDtos);
	}

	private WorkLocationSummaryResponseDto mapWorkLocationToSummaryResponseDto(WorkLocation workLocation) {
		WorkLocationSummaryResponseDto dto = new WorkLocationSummaryResponseDto();
		dto.setWorkLocationId(workLocation.getWorkLocationId());
		dto.setName(workLocation.getName());
		return dto;
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getWorkLocationById(Long id) {
		log.info("getWorkLocationById: execution started");

		WorkLocation workLocation = workLocationDao.findById(id)
			.orElseThrow(() -> new ModuleException(CommonMessageConstant.COMMON_ERROR_WORK_LOCATION_NOT_FOUND));

		Optional<WorkLocationGeofence> geofence = workLocationGeofenceDao.findByWorkLocationWorkLocationId(id);

		List<Employee> locationEmployees = employeeDao.findActiveEmployeesExcludingGuests(id);
		Long totalActiveCount = employeeDao.countActiveEmployeesExcludingGuests();
		boolean isAllEmployeesAssigned = !locationEmployees.isEmpty() && locationEmployees.size() == totalActiveCount;

		WorkLocationDetailResponseDto responseDto = new WorkLocationDetailResponseDto();
		responseDto.setWorkLocationId(workLocation.getWorkLocationId());
		responseDto.setName(workLocation.getName());
		responseDto.setAddress(workLocation.getAddress());
		responseDto.setEmployeeCount((long) locationEmployees.size());
		responseDto.setIsAllEmployees(isAllEmployeesAssigned);
		responseDto.setEmployees(isAllEmployeesAssigned ? null : locationEmployees.stream().map(emp -> {
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
			List<Employee> allActiveEmployees = employeeDao.findActiveEmployeesExcludingGuests(null);
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
		List<Employee> employees = employeeDao.findByWorkLocationWorkLocationIdAndAccountStatusIn(workLocationId,
				Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING));
		for (Employee employee : employees) {
			employee.setWorkLocation(null);
		}
		employeeDao.saveAll(employees);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto checkWorkLocationNameExists(String name) {
		log.info("checkWorkLocationNameExists: execution started");

		if (name == null || name.isBlank()) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_WORK_LOCATION_NAME_REQUIRED);
		}

		if (name.length() > CommonConstants.WORK_LOCATION_NAME_MAX_LENGTH) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_WORK_LOCATION_NAME_LENGTH_EXCEEDED);
		}

		boolean isExists = workLocationDao.existsByNameIgnoreCase(name);

		WorkLocationNameAvailabilityResponseDto responseDto = new WorkLocationNameAvailabilityResponseDto();
		responseDto.setIsExists(isExists);

		log.info("checkWorkLocationNameExists: execution ended");

		return new ResponseEntityDto(false, responseDto);
	}

}
