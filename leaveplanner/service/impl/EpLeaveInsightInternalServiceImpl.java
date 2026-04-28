package com.skapp.enterprise.leaveplanner.service.impl;

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
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class EpLeaveInsightInternalServiceImpl implements EpLeaveInsightInternalService {

	private final LeaveRequestDao leaveRequestDao;

	@Override
	@Transactional(readOnly = true)
	public EpLeaveInsightContextResponseDto getLeaveInsightContext(List<Long> employeeIds, int warningWindowDays,
			int capacityDropThresholdPct) {
		log.info(
				"getLeaveInsightContext: fetching leave insight context for {} employees, warningWindowDays={}, threshold={}",
				employeeIds == null ? 0 : employeeIds.size(), warningWindowDays, capacityDropThresholdPct);

		if (employeeIds == null || employeeIds.isEmpty() || warningWindowDays < 0) {
			return null;
		}

		LocalDate today = LocalDate.now();
		LocalDate windowEnd = today.plusDays(warningWindowDays);

		List<LeaveRequest> relevantLeaveRequests = leaveRequestDao
			.findApprovedLeaveRequestsForEmployeesInRange(employeeIds, today, windowEnd);

		boolean hasRelevantLeave = relevantLeaveRequests.stream().anyMatch(lr -> {
			boolean isOnLeave = !lr.getStartDate().isAfter(today) && !lr.getEndDate().isBefore(today);
			long daysUntilStart = ChronoUnit.DAYS.between(today, lr.getStartDate());
			return isOnLeave || daysUntilStart <= warningWindowDays;
		});

		if (!hasRelevantLeave) {
			log.info("getLeaveInsightContext: no relevant leave signals — returning null");
			return null;
		}

		List<EpLeaveInsightMemberDto> teamMembers = new ArrayList<>();
		int membersOnLeaveCount = 0;

		for (LeaveRequest lr : relevantLeaveRequests) {
			boolean isOnLeave = !lr.getStartDate().isAfter(today) && !lr.getEndDate().isBefore(today);
			long startDaysFromNow = ChronoUnit.DAYS.between(today, lr.getStartDate());
			long endDaysFromNow = ChronoUnit.DAYS.between(today, lr.getEndDate());

			if (isOnLeave) {
				membersOnLeaveCount++;
			}

			EpLeaveInsightMemberDto memberDto = new EpLeaveInsightMemberDto();
			memberDto.setUserId(lr.getEmployee().getEmployeeId());
			memberDto.setIsOnLeave(isOnLeave);
			memberDto.setLeaveStartDate(lr.getStartDate());
			memberDto.setLeaveEndDate(lr.getEndDate());
			memberDto.setLeaveStartDaysFromNow(startDaysFromNow);
			memberDto.setLeaveEndDaysFromNow(endDaysFromNow);
			memberDto.setLeaveDurationDays(lr.getDurationDays());
			teamMembers.add(memberDto);
		}

		int teamSize = employeeIds.size();
		int pctTeamOnLeave = teamSize > 0 ? (int) Math.round(100.0 * membersOnLeaveCount / teamSize) : 0;

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
