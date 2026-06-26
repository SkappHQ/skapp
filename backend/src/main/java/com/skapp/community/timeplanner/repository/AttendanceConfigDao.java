package com.skapp.community.timeplanner.repository;

import com.skapp.community.timeplanner.model.AttendanceConfig;
import com.skapp.community.timeplanner.type.AttendanceConfigType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AttendanceConfigDao extends JpaRepository<AttendanceConfig, AttendanceConfigType>,
		JpaSpecificationExecutor<AttendanceConfig>, AttendanceConfigRepository {

	AttendanceConfig findByAttendanceConfigType(AttendanceConfigType attendanceConfigType);

}
