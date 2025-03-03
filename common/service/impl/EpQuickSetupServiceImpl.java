package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.repository.LeaveTypeDao;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.HolidayDao;
import com.skapp.community.peopleplanner.repository.JobFamilyDao;
import com.skapp.community.peopleplanner.repository.TeamDao;
import com.skapp.enterprise.common.payload.response.EpQuickSetupProgressResponseDto;
import com.skapp.enterprise.common.repository.EpOrganizationConfigDao;
import com.skapp.enterprise.common.service.EpQuickSetupService;
import com.skapp.enterprise.common.type.EpOrganizationConfigType;
import com.skapp.enterprise.common.type.QuickSetupType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

@Slf4j
@Service
@RequiredArgsConstructor
public class EpQuickSetupServiceImpl implements EpQuickSetupService {

	private final EmployeeDao employeeDao;

	private final TeamDao teamDao;

	private final JobFamilyDao jobFamilyDao;

	private final HolidayDao holidayDao;

	private final LeaveTypeDao leaveTypeDao;

	private final EpOrganizationConfigDao epOrganizationConfigDao;

	@Override
	public ResponseEntityDto getQuickSetupProgress() {
		Map<QuickSetupType, Boolean> setupStatus = new EnumMap<>(QuickSetupType.class);

		setupStatus.put(QuickSetupType.INVITE_EMPLOYEES, isProgressCompleted(employeeDao::findAll, 2));
		setupStatus.put(QuickSetupType.DEFINE_TEAMS, isProgressCompleted(teamDao::findAll, 1));
		setupStatus.put(QuickSetupType.DEFINE_JOB_FAMILIES, isProgressCompleted(jobFamilyDao::findAll, 1));
		setupStatus.put(QuickSetupType.SETUP_HOLIDAYS, isProgressCompleted(holidayDao::findAll, 1));
		setupStatus.put(QuickSetupType.SETUP_LEAVE_TYPES, isProgressCompleted(leaveTypeDao::findAll, 2));

		return new ResponseEntityDto(false,
				new EpQuickSetupProgressResponseDto(calculateProgress(setupStatus), setupStatus, isSetupCompleted()));
	}

	private <T> boolean isProgressCompleted(Supplier<List<T>> supplier, int minSize) {
		List<T> list = supplier.get();
		return list.size() >= minSize;
	}

	private double calculateProgress(Map<QuickSetupType, Boolean> setupStatus) {
		if (setupStatus == null || setupStatus.isEmpty()) {
			return 0.0;
		}
		long completedCount = setupStatus.values().stream().filter(Boolean::booleanValue).count();
		return ((double) completedCount / setupStatus.size()) * 100;
	}

	private boolean isSetupCompleted() {
		return epOrganizationConfigDao
				.findOrganizationConfigByOrganizationConfigType(EpOrganizationConfigType.QUICK_SETUP_STATUS.name()).isPresent();
	}

}
