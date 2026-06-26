package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.CarryForwardInfo;

import java.time.LocalDate;
import java.util.Optional;

public interface CarryForwardInfoRepository {

	Optional<CarryForwardInfo> findByEmployeeEmployeeIdAndLeaveTypeTypeIdAndCycleEndDate(Long employeeId, Long typeId,
			LocalDate leaveCycleEndDate);

}
