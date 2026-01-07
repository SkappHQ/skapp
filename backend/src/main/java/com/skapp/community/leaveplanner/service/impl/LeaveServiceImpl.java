package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.Notification;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.NotificationDao;
import com.skapp.community.common.service.OrganizationService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.NotificationType;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.CommonModuleUtils;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.common.util.transformer.PageTransformer;
import com.skapp.community.leaveplanner.constant.LeaveMessageConstant;
import com.skapp.community.leaveplanner.constant.LeaveModuleConstant;
import com.skapp.community.leaveplanner.mapper.LeaveMapper;
import com.skapp.community.leaveplanner.model.LeaveEntitlement;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.leaveplanner.model.LeaveRequestAttachment;
import com.skapp.community.leaveplanner.model.LeaveRequestEntitlement;
import com.skapp.community.leaveplanner.model.LeaveType;
import com.skapp.community.leaveplanner.payload.LeaveEntitlementsFilterDto;
import com.skapp.community.leaveplanner.payload.LeaveRequestFilterDto;
import com.skapp.community.leaveplanner.payload.LeaveRequestManagerUpdateDto;
import com.skapp.community.leaveplanner.payload.ResourceAvailabilityCalendarFilter;
import com.skapp.community.leaveplanner.payload.request.LeavePatchRequestDto;
import com.skapp.community.leaveplanner.payload.request.LeaveRequestAvailabilityFilterDto;
import com.skapp.community.leaveplanner.payload.request.LeaveRequestByIdResponseDto;
import com.skapp.community.leaveplanner.payload.request.LeaveRequestDto;
import com.skapp.community.leaveplanner.payload.request.PendingLeaveRequestFilterDto;
import com.skapp.community.leaveplanner.payload.response.GenericLeaveResponse;
import com.skapp.community.leaveplanner.payload.response.LeaveNotificationNudgeResponseDto;
import com.skapp.community.leaveplanner.payload.response.LeaveRequestManagerResponseDto;
import com.skapp.community.leaveplanner.payload.response.LeaveRequestResponseDto;
import com.skapp.community.leaveplanner.payload.response.LeaveRequestWithEmployeeResponseDto;
import com.skapp.community.leaveplanner.payload.response.ResourceAvailabilityCalendarResponseDto;
import com.skapp.community.leaveplanner.repository.LeaveEntitlementDao;
import com.skapp.community.leaveplanner.repository.LeaveRequestDao;
import com.skapp.community.leaveplanner.repository.LeaveRequestEntitlementDao;
import com.skapp.community.leaveplanner.repository.LeaveTypeDao;
import com.skapp.community.leaveplanner.service.LeaveEmailService;
import com.skapp.community.leaveplanner.service.LeaveNotificationService;
import com.skapp.community.leaveplanner.service.LeaveService;
import com.skapp.community.leaveplanner.type.LeaveDuration;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.leaveplanner.type.LeaveState;
import com.skapp.community.leaveplanner.util.LeaveModuleUtil;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.mapper.PeopleMapper;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.model.Holiday;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.payload.response.EmployeeManagerResponseDto;
import com.skapp.community.peopleplanner.payload.response.HolidayBasicDetailsResponseDto;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeManagerDao;
import com.skapp.community.peopleplanner.repository.EmployeeTeamDao;
import com.skapp.community.peopleplanner.repository.HolidayDao;
import com.skapp.community.peopleplanner.repository.TeamDao;
import com.skapp.community.peopleplanner.service.PeopleService;
import com.skapp.community.peopleplanner.type.HolidayDuration;
import com.skapp.community.peopleplanner.util.PeopleUtil;
import com.skapp.community.timeplanner.model.TimeConfig;
import com.skapp.community.timeplanner.repository.TimeConfigDao;
import jakarta.validation.constraints.NotNull;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.Year;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

import static com.skapp.community.leaveplanner.constant.LeaveMessageConstant.LEAVE_ERROR_INFORMANT_CANNOT_UPDATE_LEAVE_REQUEST;

@Service
@Slf4j
@RequiredArgsConstructor
public class LeaveServiceImpl implements LeaveService {

	private final UserService userService;

	private final LeaveMapper leaveMapper;

	private final LeaveRequestDao leaveRequestDao;

	private final LeaveTypeDao leaveTypeDao;

	private final MessageUtil messageUtil;

	private final LeaveEntitlementDao leaveEntitlementDao;

	private final LeaveRequestEntitlementDao leaveRequestEntitlementDao;

	private final TimeConfigDao timeConfigDao;

	private final HolidayDao holidayDao;

	private final EmployeeDao employeeDao;

	private final EmployeeManagerDao employeeManagerDao;

	private final PageTransformer pageTransformer;

	private final PeopleService peopleService;

	private final TeamDao teamDao;

	private final PeopleMapper peopleMapper;

	private final EmployeeTeamDao employeeTeamDao;

	private final LeaveEmailService leaveEmailService;

	private final LeaveNotificationService leaveNotificationService;

	private final NotificationDao notificationDao;

	private final OrganizationService organizationService;

	public static int getNumberOfDaysBetweenLeaveRequestForGivenEntitlementRange(LocalDate leaveRequestStartDate,
			LocalDate leaveRequestEndDate, LocalDate entitlementValidFrom, LocalDate entitlementValidTo,
			List<TimeConfig> timeConfigs, List<LocalDate> holidays, List<Holiday> holidayObjects,
			LeaveRequest leaveRequest, String organizationTimeZone) {

		LocalDate startDate = leaveRequestStartDate.isAfter(leaveRequestEndDate) ? leaveRequestEndDate
				: leaveRequestStartDate;
		LocalDate endDate = leaveRequestEndDate.isBefore(leaveRequestStartDate) ? leaveRequestStartDate
				: leaveRequestEndDate;
		LocalDate entitlementStart = entitlementValidFrom.isAfter(entitlementValidTo) ? entitlementValidTo
				: entitlementValidFrom;
		LocalDate entitlementEnd = entitlementValidTo.isBefore(entitlementValidFrom) ? entitlementValidFrom
				: entitlementValidTo;

		LocalDate overlapStart = startDate.isAfter(entitlementStart) ? startDate : entitlementStart;
		LocalDate overlapEnd = endDate.isBefore(entitlementEnd) ? endDate : entitlementEnd;

		int count = 0;

		LocalDate currentDate = overlapStart;
		while (!currentDate.isAfter(overlapEnd)) {
			if (CommonModuleUtils.checkIfDayIsWorkingDay(currentDate, timeConfigs, organizationTimeZone)
					&& CommonModuleUtils.checkIfDayIsNotAHoliday(leaveRequest, holidayObjects, holidays, currentDate)) {
				count++;
			}
			currentDate = currentDate.plusDays(1);
		}

		return count;
	}

	@Override
	@Transactional
	public ResponseEntityDto applyLeaveRequest(@NonNull LeaveRequestDto leaveRequestDto) {
		User user = userService.getCurrentUser();
		log.info("applyLeaveRequest: execution started");

		List<EmployeeManagerResponseDto> managers = peopleService.getCurrentEmployeeManagers();
		if (managers.isEmpty()) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_NO_MANAGER_FOUND);
		}

		LeaveRequest leaveRequest = leaveMapper.leaveRequestDtoToLeaveRequest(leaveRequestDto);
		leaveRequest.setEmployee(user.getEmployee());
		leaveRequest.setStatus(LeaveRequestStatus.PENDING);

		LeaveType leaveType = validateLeaveWithLeaveType(leaveRequest.getLeaveType().getTypeId(), leaveRequestDto);
		leaveRequest.setLeaveType(leaveType);

		float durationDays = validateLeaveRequest(leaveRequest, user);
		log.info("applyLeaveRequest: {} days calculated for Leave Request", durationDays);

		if (Boolean.TRUE.equals(leaveType.getIsAttachment()) && leaveRequestDto.getAttachments() != null) {
			LeaveRequest finalLeaveRequest = leaveRequest;
			Set<LeaveRequestAttachment> leaveRequestAttachments = leaveRequestDto.getAttachments()
				.stream()
				.map(url -> new LeaveRequestAttachment(url, finalLeaveRequest))
				.collect(Collectors.toSet());
			leaveRequest.setAttachments(leaveRequestAttachments);
		}

		leaveRequest.setDurationDays(durationDays);
		Float daysUsed = leaveRequest.getDurationDays();
		leaveRequest = leaveRequestDao.save(leaveRequest);
		addUsedHoursToLeaveEntitlement(leaveRequest);

		log.info("applyLeaveRequest: {} days allocated for Leave Request ID: {}", daysUsed,
				leaveRequest.getLeaveRequestId());

		LeaveRequestByIdResponseDto leaveRequestResponseDto = leaveMapper
			.leaveRequestToLeaveRequestByIdResponseDto(leaveRequest);

		boolean isSingleDay = leaveRequest.getStartDate().equals(leaveRequest.getEndDate());
		List<EmployeeManager> employeeManagers = employeeManagerDao.findByEmployee(user.getEmployee());

		leaveEmailService.sendApplyLeaveRequestEmployeeEmail(user.getEmployee().getFirstName(),
				user.getEmployee().getLastName(), user.getEmail(), leaveRequest.getLeaveType().getName(),
				leaveRequest.getStartDate(), leaveRequest.getEndDate(), leaveRequest.getLeaveState().toString(),
				leaveRequest.getRequestDesc(), isSingleDay);

		leaveNotificationService.sendApplyLeaveRequestEmployeeNotification(user.getEmployee(),
				leaveRequest.getLeaveRequestId(), leaveRequest.getLeaveState().toString(),
				leaveRequest.getLeaveType().getName(), leaveRequest.getStartDate(), leaveRequest.getEndDate(),
				isSingleDay);

		if (Boolean.TRUE.equals(leaveType.getIsAutoApproval())) {
			handleAutoApprovalLeave(leaveRequest);
		}
		else {
			leaveEmailService.sendReceivedLeaveRequestManagerEmail(employeeManagers, user.getEmployee().getFirstName(),
					user.getEmployee().getLastName(), leaveRequest.getLeaveState().toString(),
					leaveRequest.getLeaveType().getName(), leaveRequest.getStartDate(), leaveRequest.getEndDate(),
					isSingleDay);

			leaveNotificationService.sendReceivedLeaveRequestManagerNotification(employeeManagers,
					user.getEmployee().getFirstName(), user.getEmployee().getLastName(),
					leaveRequest.getLeaveRequestId(), leaveRequest.getLeaveState().toString(),
					leaveRequest.getLeaveType().getName(), leaveRequest.getStartDate(), leaveRequest.getEndDate(),
					isSingleDay);
		}

		log.info("applyLeaveRequest: execution ended. Leave Request ID: {}", leaveRequest.getLeaveRequestId());
		return new ResponseEntityDto(false, leaveRequestResponseDto);
	}

	@Override
	public ResponseEntityDto updateLeaveRequestByManager(Long id, @NonNull LeaveRequestManagerUpdateDto updateDto,
			boolean isInvokedByManager) {
		User currentUser = userService.getCurrentUser();
		Employee currentEmployee = currentUser.getEmployee();

		log.info("updateLeaveRequestByManager: execution started for Leave Request: {}", id);
		LeaveRequest leaveRequest = findLeaveRequestByID(id, currentUser, isInvokedByManager);

		if ((leaveRequest.getStatus().equals(LeaveRequestStatus.CANCELLED))
				|| (leaveRequest.getStatus().equals(LeaveRequestStatus.REVOKED))
				|| (leaveRequest.getStatus().equals(LeaveRequestStatus.DENIED))
				|| (leaveRequest.getStatus().equals(LeaveRequestStatus.PENDING)
						&& updateDto.getStatus().equals(LeaveRequestStatus.REVOKED))
				|| (leaveRequest.getStatus().equals(LeaveRequestStatus.APPROVED)
						&& updateDto.getStatus().equals(LeaveRequestStatus.DENIED))) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_INVALID_LEAVE_REQUEST_STATUS_MANAGER);
		}

		List<Employee> informants = employeeDao
			.findInformantManagersByEmployeeID(leaveRequest.getEmployee().getEmployeeId());

		if (informants.contains(currentEmployee)) {
			throw new ModuleException(LEAVE_ERROR_INFORMANT_CANNOT_UPDATE_LEAVE_REQUEST);
		}

		if (StringUtils.isNotBlank(updateDto.getReviewerComment())) {
			leaveRequest.setReviewerComment(updateDto.getReviewerComment());
		}

		if (updateDto.getStatus() != null && !leaveRequest.getStatus().equals(updateDto.getStatus())) {
			managerUpdateLeaveRequestStatus(leaveRequest, updateDto.getStatus());
		}

		leaveRequest.setReviewer(currentEmployee);

		if (Boolean.TRUE.equals(leaveRequest.getLeaveType().getIsAutoApproval())) {
			if (!isInvokedByManager && leaveRequest.getStatus().equals(LeaveRequestStatus.APPROVED)) {
				List<EmployeeManager> managers = employeeManagerDao.findByEmployee(leaveRequest.getEmployee());
				if (!managers.isEmpty()) {
					leaveRequest.setReviewer(managers.getFirst().getManager());
				}
				leaveRequest.setIsAutoApproved(true);
			}
			else {
				leaveRequest.setIsAutoApproved(false);
			}
		}

		leaveRequest.setReviewedDate(DateTimeUtils.getCurrentUtcDateTime());
		LeaveRequest saveResponse = leaveRequestDao.save(leaveRequest);

		if (isInvokedByManager) {
			sendLeaveUpdateEmailsAndNotifications(leaveRequest);
		}

		LeaveRequestByIdResponseDto responseDto = leaveMapper.leaveRequestToLeaveRequestByIdResponseDto(saveResponse);

		log.info("updateLeaveRequestByManager: execution ended successfully for Leave Request: {}", id);
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	@Transactional
	public ResponseEntityDto updateLeaveRequestByEmployee(@NonNull LeavePatchRequestDto leavePatchRequestDto, Long id) {
		User currentUser = userService.getCurrentUser();
		log.info("updateLeaveRequestByEmployee: execution started for Leave Request: {}", id);

		LeaveRequest leaveRequest = findLeaveRequestByID(id, currentUser, false);

		validateDate(leaveRequest.getStartDate(), leavePatchRequestDto.getStartDate(),
				LeaveMessageConstant.LEAVE_ERROR_LEAVE_REQUEST_UPDATE_START_DATE_NOT_MATCH);

		validateDate(leaveRequest.getEndDate(), leavePatchRequestDto.getEndDate(),
				LeaveMessageConstant.LEAVE_ERROR_LEAVE_REQUEST_UPDATE_END_DATE_NOT_MATCH);

		if (leavePatchRequestDto.getLeaveRequestStatus() != null) {
			if (leavePatchRequestDto.getLeaveRequestStatus().equals(leaveRequest.getStatus())) {
				throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_REQUEST_UPDATE_ON_SAME_STATUS);
			}
			employeeUpdateLeaveRequestStatus(leaveRequest, leavePatchRequestDto.getLeaveRequestStatus());
		}

		if (Boolean.TRUE.equals(leavePatchRequestDto.getIsViewed()) && !leaveRequest.isViewed()) {
			leaveRequest.setViewed(true);
		}

		leaveRequest = leaveRequestDao.save(leaveRequest);

		boolean isSingleDay = leaveRequest.getStartDate().equals(leaveRequest.getEndDate());
		List<EmployeeManager> employeeManagers = employeeManagerDao.findByEmployee(currentUser.getEmployee());

		if (leavePatchRequestDto.getLeaveRequestStatus().equals(LeaveRequestStatus.CANCELLED)) {
			leaveEmailService.sendCancelLeaveRequestEmployeeEmail(currentUser.getEmail(),
					currentUser.getEmployee().getFirstName(), currentUser.getEmployee().getLastName(),
					leaveRequest.getLeaveState().toString(), leaveRequest.getLeaveType().getName(),
					leaveRequest.getStartDate(), leaveRequest.getEndDate(), isSingleDay);
			leaveEmailService.sendCancelLeaveRequestManagerEmail(employeeManagers,
					currentUser.getEmployee().getFirstName(), currentUser.getEmployee().getLastName(),
					leaveRequest.getLeaveState().toString(), leaveRequest.getLeaveType().getName(),
					leaveRequest.getStartDate(), leaveRequest.getEndDate(), isSingleDay);
			leaveNotificationService.sendCancelLeaveRequestEmployeeNotification(currentUser.getEmployee(),
					employeeManagers, leaveRequest, isSingleDay);
			leaveNotificationService.sendCancelLeaveRequestManagerNotification(currentUser.getEmployee(),
					employeeManagers, leaveRequest, isSingleDay);
		}

		LeaveRequestByIdResponseDto leaveRequestResponseDto = leaveMapper
			.leaveRequestToLeaveRequestByIdResponseDto(leaveRequest);

		log.info("updateLeaveRequestByEmployee: execution ended successfully for Leave Request: {}", id);
		return new ResponseEntityDto(false, leaveRequestResponseDto);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getCurrentUserLeaveRequests(LeaveRequestFilterDto leaveRequestFilterDto) {
		log.info("getCurrentUserLeaveRequests: execution started");

		User currentUser = userService.getCurrentUser();
		Long empId = currentUser.getUserId();

		int pageSize = leaveRequestFilterDto.getSize();

		boolean isExport = leaveRequestFilterDto.getIsExport();
		if (isExport) {
			pageSize = (int) leaveRequestDao.count();
		}

		Pageable pageable = PageRequest.of(leaveRequestFilterDto.getPage(), pageSize,
				Sort.by(leaveRequestFilterDto.getSortOrder(), leaveRequestFilterDto.getSortKey().toString()));

		Page<LeaveRequest> leaveRequests = leaveRequestDao.findAllRequestsByEmployee(empId, leaveRequestFilterDto,
				pageable);

		PageDto pageDto = pageTransformer.transform(leaveRequests);
		List<LeaveRequestResponseDto> leaveRequestResponseDtos = leaveRequests.stream()
			.map(leaveMapper::leaveRequestToLeaveRequestResponseDto)
			.toList();
		pageDto.setItems(leaveRequestResponseDtos);

		log.info("getCurrentUserLeaveRequests: execution ended");
		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getLeaveRequestById(Long id) {
		log.info("getLeaveRequestById: execution started");

		User currentUser = userService.getCurrentUser();
		LeaveRequest leaveRequest = findLeaveRequestByID(id, currentUser, false);
		LeaveRequestByIdResponseDto responseDto = leaveMapper.leaveRequestToLeaveRequestByIdResponseDto(leaveRequest);

		log.info("getLeaveRequestById: execution ended");
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	public ResponseEntityDto getAssignedLeaveRequestById(Long id) {

		log.info("getAssignedLeaveRequestById: execution started");

		User currentUser = userService.getCurrentUser();
		LeaveRequest leaveRequest = findLeaveRequestByID(id, currentUser, true);

		LeaveRequestByIdResponseDto responseDto = leaveMapper.leaveRequestToLeaveRequestByIdResponseDto(leaveRequest);

		log.info("getAssignedLeaveRequestById: execution ended");
		return new ResponseEntityDto(false, responseDto);

	}

	@Override
	@Transactional
	public ResponseEntityDto deleteLeaveRequestById(@NonNull Long id) {
		User currentUser = userService.getCurrentUser();
		log.info("deleteLeaveRequestById: execution started");

		LeaveRequest leaveRequest = findLeaveRequestByID(id, currentUser, false);

		if (leaveRequest.getStatus().equals(LeaveRequestStatus.APPROVED)
				|| leaveRequest.getStatus().equals(LeaveRequestStatus.DENIED)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_INVALID_LEAVE_REQUEST_STATUS_EMPLOYEE);
		}

		leaveRequest.setStatus(LeaveRequestStatus.CANCELLED);
		deductUsedHoursFromLeaveEntitlement(leaveRequest);

		leaveRequest = leaveRequestDao.save(leaveRequest);

		LeaveRequestResponseDto leaveRequestResDto = leaveMapper.leaveRequestToLeaveRequestResponseDto(leaveRequest);

		log.info("deleteLeaveRequestById: execution ended successfully for Leave Request: {}",
				leaveRequest.getLeaveRequestId());
		return new ResponseEntityDto(false, leaveRequestResDto);
	}

	@Override
	public ResponseEntityDto getAssignedLeavesToManager(LeaveRequestFilterDto leaveRequestFilterDto) {
		log.info("getAssignedLeavesToManager: execution started");

		validateLeaveRequestFilterData(leaveRequestFilterDto);

		User currentUser = userService.getCurrentUser();
		Long employeeId = currentUser.getUserId();

		Pageable pageable = PageRequest.of(leaveRequestFilterDto.getPage(), leaveRequestFilterDto.getSize(),
				Sort.by(leaveRequestFilterDto.getSortOrder(), leaveRequestFilterDto.getSortKey().toString()));

		Page<LeaveRequest> leaveRequests = leaveRequestDao.findAllRequestAssignedToManager(employeeId,
				leaveRequestFilterDto, pageable);

		PageDto pageDto = pageTransformer.transform(leaveRequests);
		List<LeaveRequestManagerResponseDto> list = leaveMapper.leaveRequestListToLeaveRequestManagerResponseDtoList(
				leaveRequests.hasContent() ? leaveRequests.getContent() : Collections.emptyList());

		pageDto.setItems(list);

		log.info("getAssignedLeavesToManager: execution ended with {} result(s)", list.size());
		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	public ResponseEntityDto getAssignedPendingLeavesToManager(
			PendingLeaveRequestFilterDto pendingLeaveRequestFilterDto) {
		log.info("getAssignedPendingLeavesToManager: execution started");

		User currentUser = userService.getCurrentUser();
		List<LeaveRequestManagerResponseDto> pendingLeaveRequests = leaveRequestDao
			.findPendingLeaveRequestsByManager(currentUser.getUserId(), pendingLeaveRequestFilterDto.getSearchKeyword())
			.stream()
			.map(leaveRequest -> {
				LeaveRequestManagerResponseDto mappedResponse = leaveMapper
					.leaveRequestToLeaveRequestManagerResponseDto(leaveRequest);
				mappedResponse.setStartDate(DateTimeUtils.formatDateWithSuffix(leaveRequest.getStartDate()));
				mappedResponse.setEndDate(DateTimeUtils.formatDateWithSuffix(leaveRequest.getEndDate()));
				return mappedResponse;
			})
			.toList();

		log.info("getAssignedPendingLeavesToManager: execution ended with {} result(s)", pendingLeaveRequests.size());
		return new ResponseEntityDto(false, pendingLeaveRequests);
	}

	@Override
	public ResponseEntityDto getResourceAvailabilityCalendar(
			ResourceAvailabilityCalendarFilter resourceAvailabilityCalendarFilter) {
		log.info("getResourceAvailabilityCalendar: execution started");

		validateAndFilterTeams(resourceAvailabilityCalendarFilter.getTeams());

		Year year = resourceAvailabilityCalendarFilter.getYear();
		Month month = resourceAvailabilityCalendarFilter.getMonth();
		LocalDate startDate = resourceAvailabilityCalendarFilter.getStartDate();
		LocalDate endDate = resourceAvailabilityCalendarFilter.getEndDate();

		if ((year == null || month == null) && (startDate == null || endDate == null)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_INVALID_YEAR_MONTH);
		}

		LocalDate calendarStart;
		LocalDate calendarEnd;

		if (startDate != null && endDate != null) {
			calendarStart = startDate;
			calendarEnd = endDate;
		}
		else {
			YearMonth yearMonth = YearMonth.of(year.getValue(), month);
			LocalDate firstOfMonth = yearMonth.atDay(1);
			LocalDate lastOfMonth = yearMonth.atEndOfMonth();
			calendarStart = firstOfMonth.with(DayOfWeek.MONDAY);
			calendarEnd = lastOfMonth.with(DayOfWeek.SUNDAY);
		}

		List<ResourceAvailabilityCalendarResponseDto> calendarResponses = new ArrayList<>();
		LocalDate current = calendarStart;

		User currentUser = userService.getCurrentUser();
		EmployeeRole employeeRole = currentUser.getEmployee().getEmployeeRole();
		boolean isLeaveAdmin = employeeRole.getLeaveRole().equals(Role.LEAVE_ADMIN);
		while (!current.isAfter(calendarEnd)) {
			DayOfWeek dayOfWeek = current.getDayOfWeek();

			TimeConfig timeConfig = timeConfigDao.findByDay(dayOfWeek);
			if (timeConfig != null) {
				ResourceAvailabilityCalendarResponseDto responseDto = new ResourceAvailabilityCalendarResponseDto();

				String formattedDate = DateTimeUtils.formatDateWithSuffix(current);
				responseDto.setDate(formattedDate.toUpperCase());
				responseDto.setActualDate(current);
				responseDto.setDayOfWeek(dayOfWeek.getDisplayName(TextStyle.SHORT, Locale.ENGLISH).toUpperCase());

				List<Holiday> holidays = holidayDao.findAllByDateAndIsActiveTrue(current);
				List<HolidayBasicDetailsResponseDto> holidayResponseDtos = peopleMapper
					.holidaysToHolidayBasicDetailsResponseDtos(holidays);
				responseDto.setHolidays(holidayResponseDtos);

				List<LeaveRequest> leaveRequests = leaveRequestDao.getEmployeesOnLeaveByTeamAndDate(
						resourceAvailabilityCalendarFilter.getTeams(), current, currentUser.getUserId(), isLeaveAdmin);
				List<LeaveRequestWithEmployeeResponseDto> leaveRequestResponseDtos = leaveMapper
					.leaveRequestsToLeaveRequestWithEmployeeResponseDtos(leaveRequests);
				responseDto.setLeaveRequests(leaveRequestResponseDtos);
				responseDto.setLeaveCount(leaveRequests.size());

				List<Employee> teamEmployees = employeeTeamDao.getEmployeesByTeamIds(
						resourceAvailabilityCalendarFilter.getTeams(), currentUser.getUserId(), isLeaveAdmin);
				long totalEmployeeCount = teamEmployees.size();
				long availableCount = Math.max(0, totalEmployeeCount - leaveRequests.size());
				responseDto.setAvailableCount((int) availableCount);

				calendarResponses.add(responseDto);
			}
			current = current.plusDays(1);
		}

		log.info("getResourceAvailabilityCalendar: execution ended with a total of {} dates", calendarResponses.size());
		return new ResponseEntityDto(false, calendarResponses);
	}

	@Override
	public ResponseEntityDto nudgeManagers(Long leaveRequestId) {
		Optional<LeaveRequest> leaveRequestOpt = leaveRequestDao.findById(leaveRequestId);
		if (leaveRequestOpt.isEmpty()) {
			throw new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_REQUEST_NOT_FOUND);
		}

		if (leaveRequestOpt.get().getStatus().equals(LeaveRequestStatus.APPROVED)
				|| leaveRequestOpt.get().getStatus().equals(LeaveRequestStatus.DENIED)) {
			throw new ModuleException(
					LeaveMessageConstant.LEAVE_ERROR_UNABLE_TO_NUDGE_PRE_APPROVED_DENIED_LEAVE_REQUEST);
		}

		LocalDate startDate = leaveRequestOpt.get().getStartDate();
		LocalDate endDate = leaveRequestOpt.get().getEndDate();
		if (startDate != null && endDate != null && startDate.isEqual(endDate)) {
			leaveEmailService.sendNudgeSingleDayLeaveRequestManagerEmail(leaveRequestOpt.get());
			leaveNotificationService.sendNudgeSingleDayLeaveRequestManagerNotification(leaveRequestOpt.get());
		}
		else {
			leaveEmailService.sendNudgeMultiDayLeaveRequestManagerEmail(leaveRequestOpt.get());
			leaveNotificationService.sendNudgeMultiDayLeaveRequestManagerNotification(leaveRequestOpt.get());
		}

		return new ResponseEntityDto(messageUtil.getMessage(LeaveMessageConstant.LEAVE_SUCCESS_NUDGE_MANAGER), false);
	}

	@Override
	public ResponseEntityDto leaveRequestAvailability(LeaveRequestAvailabilityFilterDto requestAvailabilityDto) {
		User currentUser = userService.getCurrentUser();
		log.info("leaveRequestAvailability: execution started");

		if (requestAvailabilityDto.getDate() == null) {
			requestAvailabilityDto.setDate(DateTimeUtils.getCurrentUtcDate());
		}

		List<LeaveRequest> leaveRequests = leaveRequestDao
			.findLeaveRequestAvailabilityForGivenDate(requestAvailabilityDto.getDate(), currentUser.getUserId());
		List<LeaveRequestResponseDto> leaveRequestAvailabilityResponse = leaveMapper
			.leaveRequestListToLeaveRequestResponseDtoList(leaveRequests);

		log.info("leaveRequestAvailability: execution ended with {} result(s)",
				leaveRequestAvailabilityResponse.size());
		return new ResponseEntityDto(false, leaveRequestAvailabilityResponse);
	}

	@Override
	public LeaveNotificationNudgeResponseDto getLeaveRequestIsNudge(@NonNull Long leaveRequestId) {
		User user = userService.getCurrentUser();
		Long userId = user.getUserId();

		log.info("getLeaveRequestIsNudge: execution started for user ID: {}", userId);

		Optional<LeaveRequest> authLeaveRequestById = leaveRequestDao.findAuthLeaveRequestById(leaveRequestId, user,
				false);

		if (authLeaveRequestById.isEmpty()) {
			log.info("getLeaveRequestIsNudge: Unauthorized leave request id: {} for user: {}", leaveRequestId, userId);
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
		}

		Notification notification = notificationDao.findFirstByResourceIdAndNotificationTypeOrderByCreatedDateDesc(
				String.valueOf(leaveRequestId), NotificationType.LEAVE_REQUEST_NUDGE);

		LeaveNotificationNudgeResponseDto leaveNotificationNudgeResponseDto = new LeaveNotificationNudgeResponseDto();
		if (notification != null) {
			boolean shouldNudgeAllowed = isLeaveRequestNudgeAllowed(notification.getCreatedDate());

			leaveNotificationNudgeResponseDto.setIsNudge(shouldNudgeAllowed);
			leaveNotificationNudgeResponseDto.setLastNudgedDateTime(notification.getCreatedDate());
		}
		else {
			leaveNotificationNudgeResponseDto.setIsNudge(true);
		}

		log.info("getLeaveRequestIsNudge: returned {}  for user ID: {} and {}",
				leaveNotificationNudgeResponseDto.getIsNudge(), userId, leaveRequestId);
		return leaveNotificationNudgeResponseDto;
	}

	private void sendLeaveUpdateEmailsAndNotifications(LeaveRequest leaveRequest) {
		if (leaveRequest.getStatus().equals(LeaveRequestStatus.APPROVED)
				&& leaveRequest.getStartDate() == leaveRequest.getEndDate()) {
			leaveEmailService.sendApprovedSingleDayLeaveRequestEmployeeEmail(leaveRequest);
			leaveNotificationService.sendApprovedSingleDayLeaveRequestEmployeeNotification(leaveRequest);

			leaveEmailService.sendApprovedSingleDayLeaveRequestManagerEmail(leaveRequest);
			leaveNotificationService.sendApprovedSingleDayLeaveRequestManagerNotification(leaveRequest);
		}
		else if (leaveRequest.getStatus().equals(LeaveRequestStatus.APPROVED)) {
			leaveEmailService.sendApprovedMultiDayLeaveRequestEmployeeEmail(leaveRequest);
			leaveNotificationService.sendApprovedMultiDayLeaveRequestEmployeeNotification(leaveRequest);

			leaveEmailService.sendApprovedMultiDayLeaveRequestManagerEmail(leaveRequest);
			leaveNotificationService.sendApprovedMultiDayLeaveRequestManagerNotification(leaveRequest);
		}

		if (leaveRequest.getStatus().equals(LeaveRequestStatus.REVOKED)
				&& leaveRequest.getStartDate() == leaveRequest.getEndDate()) {
			leaveEmailService.sendRevokedSingleDayLeaveRequestEmployeeEmail(leaveRequest);
			leaveNotificationService.sendRevokedSingleDayLeaveRequestEmployeeNotification(leaveRequest);

			leaveEmailService.sendRevokedSingleDayLeaveRequestManagerEmail(leaveRequest);
			leaveNotificationService.sendRevokedSingleDayLeaveRequestManagerNotification(leaveRequest);
		}
		else if (leaveRequest.getStatus().equals(LeaveRequestStatus.REVOKED)) {
			leaveEmailService.sendRevokedMultiDayLeaveRequestEmployeeEmail(leaveRequest);
			leaveNotificationService.sendRevokedMultiDayLeaveRequestEmployeeNotification(leaveRequest);

			leaveEmailService.sendRevokedMultiDayLeaveRequestManagerEmail(leaveRequest);
			leaveNotificationService.sendRevokedMultiDayLeaveRequestManagerEmail(leaveRequest);
		}

		if (leaveRequest.getStatus().equals(LeaveRequestStatus.DENIED)
				&& leaveRequest.getStartDate() == leaveRequest.getEndDate()) {
			leaveEmailService.sendDeclinedSingleDayLeaveRequestEmployeeEmail(leaveRequest);
			leaveNotificationService.sendDeclinedSingleDayLeaveRequestEmployeeNotification(leaveRequest);

			leaveEmailService.sendDeclinedSingleDayLeaveRequestManagerEmail(leaveRequest);
			leaveNotificationService.sendDeclinedSingleDayLeaveRequestManagerNotification(leaveRequest);
		}
		else if (leaveRequest.getStatus().equals(LeaveRequestStatus.DENIED)) {
			leaveEmailService.sendDeclinedMultiDayLeaveRequestEmployeeEmail(leaveRequest);
			leaveNotificationService.sendDeclinedMultiDayLeaveRequestEmployeeNotification(leaveRequest);

			leaveEmailService.sendDeclinedMultiDayLeaveRequestManagerEmail(leaveRequest);
			leaveNotificationService.sendDeclinedMultiDayLeaveRequestManagerNotification(leaveRequest);
		}
	}

	private boolean isLeaveRequestNudgeAllowed(LocalDateTime lastNudgeNotificationDate) {
		LocalDateTime now = DateTimeUtils.getCurrentUtcDateTime();
		Duration duration = Duration.between(lastNudgeNotificationDate, now);
		long hours = duration.toHours();
		return hours >= LeaveModuleConstant.HOURS_PER_DAY;
	}

	private void validateAndFilterTeams(List<Long> teamIds) {
		if (teamIds == null || (teamIds.size() == 1 && teamIds.contains(-1L))) {
			return;
		}

		User currentUser = userService.getCurrentUser();
		List<Team> teams = teamDao.findByTeamIdIn(teamIds);
		boolean isSuperAdminOrAttendanceAdmin = isUserSuperAdminOrLeaveAdmin(currentUser);

		PeopleUtil.validateTeamsExist(teamIds, teams);
		if (!isSuperAdminOrAttendanceAdmin) {
			validateUserBelongsToTeams(teams, currentUser);
		}
	}

	private boolean isUserSuperAdminOrLeaveAdmin(User user) {
		EmployeeRole role = user.getEmployee().getEmployeeRole();
		return role.getIsSuperAdmin() || Role.LEAVE_ADMIN.equals(role.getLeaveRole());
	}

	private void validateUserBelongsToTeams(List<Team> teams, User user) {
		List<Long> notBelongingTeams = teams.stream()
			.filter(team -> team.getEmployees()
				.stream()
				.noneMatch(emp -> emp.getEmployee().getEmployeeId().equals(user.getEmployee().getEmployeeId())))
			.map(Team::getTeamId)
			.toList();

		if (!notBelongingTeams.isEmpty()) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_USER_NOT_BELONGS_TO_SELECTED_TEAMS,
					new String[] { notBelongingTeams.toString() });
		}
	}

	private void validateLeaveRequestFilterData(LeaveRequestFilterDto leaveRequestFilterDto) {
		if (leaveRequestFilterDto.getStartDate() == null || leaveRequestFilterDto.getEndDate() == null) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_REQUEST_DATE_RANGE_REQUIRED);
		}

		if (leaveRequestFilterDto.getStartDate().isAfter(leaveRequestFilterDto.getEndDate())) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_REQUEST_DATE_RANGE_INVALID);
		}
	}

	public LeaveRequest findLeaveRequestByID(@NonNull Long id, User user, Boolean isManager) {
		log.info("findLeaveRequestByID: execution started for Leave Request: {}", id);
		Optional<LeaveRequest> optionalLeaveRequest = leaveRequestDao.findAuthLeaveRequestById(id, user, isManager);

		if (optionalLeaveRequest.isEmpty()) {
			throw new EntityNotFoundException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_REQUEST_NOT_FOUND);
		}

		log.info("findLeaveRequestByID: execution ended successfully for Leave Request: {}", id);
		return optionalLeaveRequest.get();
	}

	public float validateLeaveRequest(LeaveRequest leaveRequest, @NotNull User user) {
		Long employeeId = user.getUserId();

		if (leaveRequest.getEndDate().isBefore(leaveRequest.getStartDate())) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_REQUEST_NOT_VALID_DATE_RANGE);
		}

		LeaveRequestFilterDto leaveRequestFilterDto = new LeaveRequestFilterDto();
		leaveRequestFilterDto.setStartDate(leaveRequest.getStartDate());
		leaveRequestFilterDto.setEndDate(leaveRequest.getEndDate());
		List<LeaveRequest> leaveRequestsList = leaveRequestDao.findLeaveRequestsByDateRange(leaveRequestFilterDto,
				employeeId);

		if (leaveRequest.getLeaveState().equals(LeaveState.HALFDAY_EVENING)
				|| leaveRequest.getLeaveState().equals(LeaveState.HALFDAY_MORNING)) {

			AtomicBoolean isLeaveRequestValid = new AtomicBoolean(true);
			leaveRequestsList.forEach(request -> {
				if (request.getLeaveState().equals(leaveRequest.getLeaveState())
						|| request.getLeaveState().equals(LeaveState.FULLDAY)) {
					isLeaveRequestValid.set(false);
				}
			});

			if (!isLeaveRequestValid.get()) {
				throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_REQUEST_OVERLAP);
			}
		}

		if (!leaveRequestsList.isEmpty() && leaveRequest.getLeaveState().equals(LeaveState.FULLDAY)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_REQUEST_OVERLAP);
		}

		GenericLeaveResponse<Float, Boolean> isValidLeaveEntitlement = validateLeaveEntitlements(leaveRequest,
				employeeId);

		if (Boolean.FALSE.equals(isValidLeaveEntitlement.getGenericSecond())) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_ENTITLEMENT_NOT_SUFFICIENT);
		}

		if (leaveRequest.getRequestDesc() != null && !leaveRequest.getRequestDesc().isEmpty()
				&& (leaveRequest.getRequestDesc().length() > 255)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_REQUEST_DESCRIPTION_PASSED_MAX_LENGTH);
		}

		return isValidLeaveEntitlement.getGenericFirst();
	}

	public GenericLeaveResponse<Float, Boolean> validateLeaveEntitlements(LeaveRequest leaveRequest, Long employeeId) {
		LeaveEntitlementsFilterDto leaveEntitlementsFilterDto = new LeaveEntitlementsFilterDto();
		leaveEntitlementsFilterDto.setLeaveTypeId(leaveRequest.getLeaveType().getTypeId());

		List<LeaveEntitlement> leaveEntitlements = leaveEntitlementDao.findAllByEmployeeId(employeeId,
				leaveEntitlementsFilterDto);

		if (leaveEntitlements == null || leaveEntitlements.isEmpty() || leaveEntitlements.getFirst() == null) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_ENTITLEMENT_NOT_FOUND);
		}

		leaveEntitlements.sort(Comparator.comparing(LeaveEntitlement::getValidTo));

		List<TimeConfig> timeConfigs = timeConfigDao.findAll();
		List<LocalDate> holidayDates = holidayDao.findAllByIsActiveTrue().stream().map(Holiday::getDate).toList();
		List<Holiday> holidayObjects = holidayDao.findAllByIsActiveTrue();

		validateLeaveWithHoliday(leaveRequest.getStartDate(), leaveRequest.getEndDate(), holidayObjects, leaveRequest);

		float weekDays = LeaveModuleUtil.getWorkingDaysBetweenTwoDates(leaveRequest.getStartDate(),
				leaveRequest.getEndDate(), timeConfigs, holidayObjects, organizationService.getOrganizationTimeZone());

		if (weekDays <= 0) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_ENTITLEMENT_NOT_APPLICABLE);
		}

		float totalRequestedDayCount = weekDays;

		if (weekDays == 1 && isHalfDay(leaveRequest.getLeaveState())) {
			totalRequestedDayCount = LeaveModuleConstant.HALF_DAY;
		}

		float remainingTotalDays = getRemainingTotalHours(leaveEntitlements, leaveRequest, timeConfigs, holidayDates,
				totalRequestedDayCount, holidayObjects);

		boolean isValid = remainingTotalDays >= totalRequestedDayCount;

		if (!isValid)
			totalRequestedDayCount = 0;

		return new GenericLeaveResponse<>(totalRequestedDayCount, isValid);
	}

	public boolean isHalfDay(LeaveState leaveState) {
		return leaveState.equals(LeaveState.HALFDAY_EVENING) || leaveState.equals(LeaveState.HALFDAY_MORNING);
	}

	public float getAvailableCountOfOtherEntitlementsIncludesDateRanges(List<LeaveEntitlement> leaveEntitlements,
			LocalDate leaveRequestStartDateForEntitlement, LocalDate leaveRequestEndDateForEntitlement,
			long currentEntitlementId) {

		final float[] remainingCount = { 0 };

		leaveEntitlements.forEach(entitlement -> {
			LocalDate validFrom = entitlement.getValidFrom();
			LocalDate validTo = entitlement.getValidTo();

			if ((leaveRequestEndDateForEntitlement.isEqual(validFrom)
					|| leaveRequestEndDateForEntitlement.isAfter(validFrom))
					&& (leaveRequestEndDateForEntitlement.isEqual(validTo)
							|| leaveRequestEndDateForEntitlement.isBefore(validTo))
					&& leaveRequestStartDateForEntitlement.isAfter(validFrom)
					&& entitlement.getEntitlementId() != currentEntitlementId) {
				remainingCount[0] += (entitlement.getTotalDaysAllocated() - entitlement.getTotalDaysUsed());
			}
		});
		return remainingCount[0];
	}

	private void managerUpdateLeaveRequestStatus(LeaveRequest leaveRequest, LeaveRequestStatus updateStatus) {

		log.info("managerUpdateLeaveRequestStatus: updating status to: {}", updateStatus);
		LeaveRequestStatus currentStatus = leaveRequest.getStatus();

		if (updateStatus.equals(LeaveRequestStatus.CANCELLED)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_INVALID_LEAVE_REQUEST_STATUS_MANAGER);
		}

		if (currentStatus.equals(LeaveRequestStatus.CANCELLED) && ((updateStatus.equals(LeaveRequestStatus.APPROVED))
				|| updateStatus.equals(LeaveRequestStatus.DENIED))) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_INVALID_LEAVE_REQUEST_STATUS_MANAGER);
		}

		if (currentStatus.equals(LeaveRequestStatus.PENDING) && updateStatus.equals(LeaveRequestStatus.DENIED)) {
			deductUsedHoursFromLeaveEntitlement(leaveRequest);
		}

		if (currentStatus.equals(LeaveRequestStatus.DENIED) && updateStatus.equals(LeaveRequestStatus.PENDING)) {
			addUsedHoursToLeaveEntitlement(leaveRequest);
		}

		if (currentStatus.equals(LeaveRequestStatus.APPROVED) && updateStatus.equals(LeaveRequestStatus.REVOKED)) {
			deductUsedHoursFromLeaveEntitlement(leaveRequest);
		}

		if (currentStatus.equals(LeaveRequestStatus.REVOKED) && updateStatus.equals(LeaveRequestStatus.APPROVED)) {
			addUsedHoursToLeaveEntitlement(leaveRequest);
		}

		leaveRequest.setStatus(updateStatus);
	}

	private void deductUsedHoursFromLeaveEntitlement(LeaveRequest leaveRequest) {
		List<LeaveRequestEntitlement> leaveRequestEntitlements = leaveRequestEntitlementDao
			.findAllByLeaveRequest(leaveRequest);

		leaveRequestEntitlements.forEach(leaveRequestEntitlement -> {
			LeaveEntitlement leaveEntitlement = leaveRequestEntitlement.getLeaveEntitlement();
			Float totalDaysUsed = leaveEntitlement.getTotalDaysUsed();
			Float daysUsedByCurrentLR = leaveRequestEntitlement.getDaysUsed();

			leaveEntitlement.setTotalDaysUsed(totalDaysUsed - daysUsedByCurrentLR);
			log.info("deductUsedHoursFromLeaveEntitlement: {} days deducted from leave entitlement {}: ",
					daysUsedByCurrentLR, leaveEntitlement.getEntitlementId());
		});

		leaveRequestEntitlementDao.deleteAllInBatch(leaveRequestEntitlements);
	}

	private void employeeUpdateLeaveRequestStatus(LeaveRequest leaveRequest, LeaveRequestStatus updateStatus) {

		log.info("employeeUpdateLeaveRequestStatus: updating status to: {}", updateStatus);
		LeaveRequestStatus currentStatus = leaveRequest.getStatus();

		if (updateStatus.equals(LeaveRequestStatus.DENIED) || updateStatus.equals(LeaveRequestStatus.APPROVED)
				|| updateStatus.equals(LeaveRequestStatus.REVOKED)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_INVALID_LEAVE_REQUEST_STATUS_EMPLOYEE);
		}

		if (currentStatus.equals(LeaveRequestStatus.PENDING) && updateStatus.equals(LeaveRequestStatus.CANCELLED)) {
			deductUsedHoursFromLeaveEntitlement(leaveRequest);
		}

		if (currentStatus.equals(LeaveRequestStatus.CANCELLED) && updateStatus.equals(LeaveRequestStatus.PENDING)) {
			addUsedHoursToLeaveEntitlement(leaveRequest);
		}

		leaveRequest.setStatus(updateStatus);
	}

	private LeaveType validateLeaveWithLeaveType(Long leaveTypeId, LeaveRequestDto leaveRequestDto) {
		Optional<LeaveType> leaveTypeOptional = leaveTypeDao.findById(leaveTypeId);
		if (leaveTypeOptional.isEmpty()) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_TYPE_NOT_FOUND);
		}
		if (Boolean.FALSE.equals(leaveTypeOptional.get().getIsActive())) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_TYPE_INACTIVE);
		}
		if (Boolean.TRUE.equals(leaveTypeOptional.get().getIsAttachmentMandatory())
				&& (leaveRequestDto.getAttachments() == null || leaveRequestDto.getAttachments().isEmpty())) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_MUST_INCLUDE_ATTACHMENT);
		}
		if (Boolean.TRUE.equals(leaveTypeOptional.get().getIsCommentMandatory())
				&& (leaveRequestDto.getRequestDesc() == null || leaveRequestDto.getRequestDesc().isEmpty())) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_MUST_INCLUDE_COMMENT);
		}
		if (leaveTypeOptional.get().getLeaveDuration().equals(LeaveDuration.FULL_DAY)
				&& (leaveRequestDto.getLeaveState().equals(LeaveState.HALFDAY_MORNING)
						|| leaveRequestDto.getLeaveState().equals(LeaveState.HALFDAY_EVENING))) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_CANNOT_APPLY_HALFDAY_FOR_LEAVE_TYPE);
		}
		else if (leaveTypeOptional.get().getLeaveDuration().equals(LeaveDuration.HALF_DAY)
				&& leaveRequestDto.getLeaveState().equals(LeaveState.FULLDAY)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_CANNOT_APPLY_FULLDAY_FOR_LEAVE_TYPE);
		}

		return leaveTypeOptional.get();
	}

	private void validateLeaveWithHoliday(LocalDate startDate, LocalDate endDate, List<Holiday> holidayObjects,
			LeaveRequest leaveRequest) {

		if (startDate == null || endDate == null) {
			return;
		}

		boolean isSingleDayLeave = startDate.equals(endDate);
		HolidayDuration holidayDuration = isSingleDayLeave
				? LeaveModuleUtil.getHolidayAvailabilityOnGivenDate(startDate, holidayObjects)
				: LeaveModuleUtil.getHolidayAvailabilityOnGivenDateRange(startDate, endDate, holidayObjects);

		if (holidayDuration == null || holidayDuration.equals(HolidayDuration.FULL_DAY)) {
			return;
		}

		if (isSingleDayLeave) {
			validateSingleDayLeave(leaveRequest, holidayDuration);
		}
		else if (isHalfDayHoliday(holidayDuration)
				&& leaveRequest.getLeaveType().getLeaveDuration().equals(LeaveDuration.FULL_DAY)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_ENTITLEMENT_NOT_APPLICABLE);
		}
	}

	private void validateSingleDayLeave(LeaveRequest leaveRequest, HolidayDuration holidayDuration) {
		if (leaveRequest.getLeaveState().equals(LeaveState.FULLDAY)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_ENTITLEMENT_NOT_APPLICABLE);
		}

		boolean isMorningConflict = holidayDuration.equals(HolidayDuration.HALF_DAY_MORNING)
				&& leaveRequest.getLeaveState().equals(LeaveState.HALFDAY_MORNING);
		boolean isEveningConflict = holidayDuration.equals(HolidayDuration.HALF_DAY_EVENING)
				&& leaveRequest.getLeaveState().equals(LeaveState.HALFDAY_EVENING);

		if (isMorningConflict || isEveningConflict) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_ENTITLEMENT_NOT_APPLICABLE);
		}
	}

	private boolean isHalfDayHoliday(HolidayDuration holidayDuration) {
		return holidayDuration.equals(HolidayDuration.HALF_DAY_MORNING)
				|| holidayDuration.equals(HolidayDuration.HALF_DAY_EVENING);
	}

	private float getRemainingTotalHours(List<LeaveEntitlement> leaveEntitlements, LeaveRequest leaveRequest,
			List<TimeConfig> timeConfigs, List<LocalDate> holidays, float totalRequestedDayCount,
			List<Holiday> holidayObjects) {

		float remainingCount = 0.0f;

		LocalDate selectedStartDate = leaveRequest.getStartDate();
		LocalDate selectedEndDate = leaveRequest.getEndDate();
		LocalDate currentDate = selectedStartDate;

		String organizationTimeZone = organizationService.getOrganizationTimeZone();

		for (LeaveEntitlement selectedEntitlement : leaveEntitlements) {
			LocalDate validFrom = selectedEntitlement.getValidFrom();
			LocalDate validTo = selectedEntitlement.getValidTo();

			int numberOfWorkingDays = getNumberOfDaysBetweenLeaveRequestForGivenEntitlementRange(currentDate,
					selectedEndDate, validFrom, validTo, timeConfigs, holidays, holidayObjects, leaveRequest,
					organizationTimeZone);

			if (numberOfWorkingDays > 0) {
				float numberOfDaysToDeduct = leaveRequest.getLeaveState().equals(LeaveState.HALFDAY_EVENING)
						|| leaveRequest.getLeaveState().equals(LeaveState.HALFDAY_MORNING)
								? LeaveModuleConstant.HALF_DAY : numberOfWorkingDays;

				if (selectedEntitlement.getTotalDaysAllocated()
						- selectedEntitlement.getTotalDaysUsed() >= numberOfDaysToDeduct) {
					remainingCount += numberOfDaysToDeduct;
				}
				else {
					LocalDate leaveRequestEndDateForEntitlement = currentDate
						.plusDays((int) (selectedEntitlement.getTotalDaysAllocated()
								- selectedEntitlement.getTotalDaysUsed()));

					float otherEntitlementsRemaining = getAvailableCountOfOtherEntitlementsIncludesDateRanges(
							leaveEntitlements, leaveRequestEndDateForEntitlement, validTo,
							selectedEntitlement.getEntitlementId());

					float currentEntitlementRemaining = (selectedEntitlement.getTotalDaysAllocated()
							- selectedEntitlement.getTotalDaysUsed());

					if ((otherEntitlementsRemaining + currentEntitlementRemaining) < numberOfDaysToDeduct) {
						throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_ENTITLEMENT_NOT_SUFFICIENT);
					}

					remainingCount += (otherEntitlementsRemaining + currentEntitlementRemaining);
				}
				currentDate = currentDate.plusDays(numberOfWorkingDays);
			}

			if (remainingCount >= totalRequestedDayCount) {
				break;
			}
		}

		if (remainingCount == 0) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_ENTITLEMENT_NOT_APPLICABLE);
		}

		return remainingCount;
	}

	private void addUsedHoursToLeaveEntitlement(LeaveRequest leaveRequest) {
		List<TimeConfig> timeConfigs = timeConfigDao.findAll();
		List<LocalDate> holidayDates = holidayDao.findAllByIsActiveTrue().stream().map(Holiday::getDate).toList();
		List<Holiday> holidayObjects = holidayDao.findAllByIsActiveTrue();

		removeExistingEntitlements(leaveRequest);

		List<LeaveEntitlement> leaveEntitlements = leaveEntitlementDao
			.findAllByEmployeeAndLeaveTypeAndIsActiveTrue(leaveRequest.getEmployee(), leaveRequest.getLeaveType());

		if (leaveEntitlements.isEmpty()) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_NOT_VALID_LEAVE_REQUEST);
		}

		leaveEntitlements.sort(Comparator.comparing(LeaveEntitlement::getValidTo));

		float leaveDays = leaveRequest.getDurationDays();
		List<LeaveRequestEntitlement> leaveRequestEntitlements = new ArrayList<>();

		LocalDate startCal = leaveRequest.getStartDate();
		LocalDate selectedEndDate = leaveRequest.getEndDate();

		for (LeaveEntitlement leaveEntitlement : leaveEntitlements) {
			if (leaveDays == 0)
				break;

			float entitlementRemainingDays = leaveEntitlement.getTotalDaysAllocated()
					- leaveEntitlement.getTotalDaysUsed();
			int workingDays = getNumberOfWorkingDaysForEntitlementRange(startCal, selectedEndDate, leaveEntitlement,
					timeConfigs, holidayDates, holidayObjects, leaveRequest);

			if (workingDays > 0 && entitlementRemainingDays > 0) {
				float daysToUtilize = calculateDaysToUtilize(leaveDays, entitlementRemainingDays, workingDays,
						leaveRequest.getLeaveState());
				leaveDays -= daysToUtilize;

				updateLeaveEntitlement(leaveEntitlement, daysToUtilize);
				leaveRequestEntitlements
					.add(createLeaveRequestEntitlement(leaveRequest, leaveEntitlement, daysToUtilize));

				startCal = DateTimeUtils.incrementDays(startCal, workingDays);
			}
		}

		leaveRequestEntitlementDao.saveAll(leaveRequestEntitlements);
	}

	private void removeExistingEntitlements(LeaveRequest leaveRequest) {
		if (leaveRequest.getLeaveRequestId() != null) {
			List<LeaveRequestEntitlement> existingEntitlements = leaveRequestEntitlementDao
				.findAllByLeaveRequest(leaveRequest);
			leaveRequestEntitlementDao.deleteAllInBatch(existingEntitlements);
		}
	}

	private int getNumberOfWorkingDaysForEntitlementRange(LocalDate startCal, LocalDate selectedEndDate,
			LeaveEntitlement leaveEntitlement, List<TimeConfig> timeConfigs, List<LocalDate> holidayDates,
			List<Holiday> holidayObjects, LeaveRequest leaveRequest) {
		return getNumberOfDaysBetweenLeaveRequestForGivenEntitlementRange(startCal, selectedEndDate,
				leaveEntitlement.getValidFrom(), leaveEntitlement.getValidTo(), timeConfigs, holidayDates,
				holidayObjects, leaveRequest, organizationService.getOrganizationTimeZone());
	}

	private float calculateDaysToUtilize(float leaveDays, float entitlementRemainingDays, int workingDays,
			LeaveState leaveState) {
		float daysToUtilize = Math.min(Math.min(entitlementRemainingDays, leaveDays), workingDays);
		if (leaveState.equals(LeaveState.HALFDAY_MORNING) || leaveState.equals(LeaveState.HALFDAY_EVENING)) {
			daysToUtilize = LeaveModuleConstant.HALF_DAY;
		}
		return daysToUtilize;
	}

	private void updateLeaveEntitlement(LeaveEntitlement leaveEntitlement, float daysUsed) {
		leaveEntitlement.setTotalDaysUsed(leaveEntitlement.getTotalDaysUsed() + daysUsed);
	}

	private LeaveRequestEntitlement createLeaveRequestEntitlement(LeaveRequest leaveRequest,
			LeaveEntitlement leaveEntitlement, float daysUsed) {
		LeaveRequestEntitlement leaveRequestEntitlement = new LeaveRequestEntitlement();
		leaveRequestEntitlement.setLeaveRequest(leaveRequest);
		leaveRequestEntitlement.setLeaveEntitlement(leaveEntitlement);
		leaveRequestEntitlement.setDaysUsed(daysUsed);
		return leaveRequestEntitlement;
	}

	private void handleAutoApprovalLeave(LeaveRequest leaveRequest) {
		User user = userService.getCurrentUser();
		log.info(
				"handleAutoApprovalLeave: handleAutoApprovalLeave execution started to leave Request ID {} of Employee ID {}",
				leaveRequest.getLeaveRequestId(), user.getEmployee().getEmployeeId());

		LeaveRequestManagerUpdateDto managerUpdateDto = new LeaveRequestManagerUpdateDto();
		managerUpdateDto.setStatus(LeaveRequestStatus.APPROVED);
		managerUpdateDto.setReviewerComment(
				String.format(messageUtil.getMessage(LeaveMessageConstant.LEAVE_SUCCESS_AUTO_APPROVAL_LEAVE_APPROVED),
						leaveRequest.getLeaveType().getName()));

		updateLeaveRequestByManager(leaveRequest.getLeaveRequestId(), managerUpdateDto, false);

		if (leaveRequest.getStartDate().equals(leaveRequest.getEndDate())) {
			leaveEmailService.sendAutoApprovedSingleDayLeaveRequestEmployeeEmail(leaveRequest);
			leaveNotificationService.sendAutoApprovedSingleDayLeaveRequestEmployeeNotification(leaveRequest);

			leaveEmailService.sendAutoApprovedSingleDayLeaveRequestManagerEmail(leaveRequest);
			leaveNotificationService.sendAutoApprovedSingleDayLeaveRequestManagerNotification(leaveRequest);
		}
		else {
			leaveEmailService.sendAutoApprovedMultiDayLeaveRequestEmployeeEmail(leaveRequest);
			leaveNotificationService.sendAutoApprovedMultiDayLeaveRequestEmployeeNotification(leaveRequest);

			leaveEmailService.sendAutoApprovedMultiDayLeaveRequestManagerEmail(leaveRequest);
			leaveNotificationService.sendAutoApprovedMultiDayLeaveRequestManagerNotification(leaveRequest);
		}

		log.info("handleAutoApprovalLeave: handleAutoApprovalLeave execution ended.");
	}

	private void validateDate(LocalDate existingDate, LocalDate patchDate, LeaveMessageConstant errorMessage) {
		if (patchDate != null && !existingDate.isEqual(patchDate)) {
			throw new ModuleException(errorMessage);
		}
	}

}
