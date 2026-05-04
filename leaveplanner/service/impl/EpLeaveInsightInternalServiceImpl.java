package com.skapp.enterprise.leaveplanner.service.impl;

import com.skapp.community.common.service.OrganizationService;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.leaveplanner.repository.LeaveRequestDao;
import com.skapp.enterprise.leaveplanner.payload.response.EpLeaveInsightContextResponseDto;
import com.skapp.enterprise.leaveplanner.payload.response.EpLeaveInsightMemberDto;
import com.skapp.enterprise.leaveplanner.service.EpLeaveInsightInternalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class EpLeaveInsightInternalServiceImpl implements EpLeaveInsightInternalService {

	private static final int MAX_WARNING_WINDOW_DAYS = 365;

	private final LeaveRequestDao leaveRequestDao;

	private final OrganizationService organizationService;

	@Override
	@Transactional(readOnly = true)
	public EpLeaveInsightContextResponseDto getLeaveInsightContext(List<Long> employeeIds, int warningWindowDays,
			int capacityDropThresholdPct) {
		log.info(
				"getLeaveInsightContext: fetching leave insight context for {} employees, warningWindowDays={}, threshold={}",
				employeeIds == null ? 0 : employeeIds.size(), warningWindowDays, capacityDropThresholdPct);

		if (employeeIds == null || employeeIds.isEmpty()) {
			return null;
		}

		if (warningWindowDays < 0 || warningWindowDays > MAX_WARNING_WINDOW_DAYS) {
			return null;
		}

		ZoneId orgZone = ZoneId.of(organizationService.getOrganizationTimeZone());
		LocalDate today = LocalDate.now(orgZone);
		LocalDate windowEnd = today.plusDays(warningWindowDays);

		int teamSize = new HashSet<>(employeeIds).size();

		List<LeaveRequest> relevantLeaveRequests = leaveRequestDao
			.findApprovedLeaveRequestsForEmployeesInRange(employeeIds, today, windowEnd);

		if (relevantLeaveRequests.isEmpty()) {
			log.info("getLeaveInsightContext: no relevant leave signals — returning null");
			return null;
		}

		Map<Long, LeaveRequest> bestLeaveByEmployee = new LinkedHashMap<>();
		for (LeaveRequest lr : relevantLeaveRequests) {
			Long empId = lr.getEmployee().getEmployeeId();
			boolean isOnLeave = !lr.getStartDate().isAfter(today) && !lr.getEndDate().isBefore(today);
			LeaveRequest existing = bestLeaveByEmployee.get(empId);
			if (existing == null) {
				bestLeaveByEmployee.put(empId, lr);
			}
			else {
				boolean existingIsOnLeave = !existing.getStartDate().isAfter(today)
						&& !existing.getEndDate().isBefore(today);
				if ((isOnLeave && !existingIsOnLeave)
						|| (isOnLeave == existingIsOnLeave && lr.getStartDate().isBefore(existing.getStartDate()))) {
					bestLeaveByEmployee.put(empId, lr);
				}
			}
		}

		List<EpLeaveInsightMemberDto> teamMembers = new ArrayList<>();
		Set<Long> onLeaveEmployeeIds = new HashSet<>();

		for (LeaveRequest lr : bestLeaveByEmployee.values()) {
			boolean isOnLeave = !lr.getStartDate().isAfter(today) && !lr.getEndDate().isBefore(today);
			long startDaysFromNow = ChronoUnit.DAYS.between(today, lr.getStartDate());
			long endDaysFromNow = ChronoUnit.DAYS.between(today, lr.getEndDate());

			if (isOnLeave) {
				onLeaveEmployeeIds.add(lr.getEmployee().getEmployeeId());
			}

			EpLeaveInsightMemberDto memberDto = new EpLeaveInsightMemberDto();
			memberDto.setEmployeeId(lr.getEmployee().getEmployeeId());
			memberDto.setIsOnLeave(isOnLeave);
			memberDto.setLeaveStartDate(lr.getStartDate());
			memberDto.setLeaveEndDate(lr.getEndDate());
			memberDto.setLeaveStartDaysFromNow(startDaysFromNow);
			memberDto.setLeaveEndDaysFromNow(endDaysFromNow);
			memberDto.setLeaveDurationDays(lr.getDurationDays());
			teamMembers.add(memberDto);
		}

		int membersOnLeaveCount = onLeaveEmployeeIds.size();
		int pctTeamOnLeave = (int) Math.round(100.0 * membersOnLeaveCount / teamSize);

		EpLeaveInsightContextResponseDto response = new EpLeaveInsightContextResponseDto();
		response.setLeaveWarningWindowDays(warningWindowDays);
		response.setCapacityDropThresholdPct(capacityDropThresholdPct);
		response.setTeamSize(teamSize);
		response.setMembersOnLeaveCount(membersOnLeaveCount);
		response.setPctTeamOnLeave(pctTeamOnLeave);
		response.setTeamMembers(teamMembers);

		log.info("getLeaveInsightContext: built context — teamSize={}, membersOnLeave={}, pct={}", teamSize,
				membersOnLeaveCount, pctTeamOnLeave);

		return response;
	}

}
