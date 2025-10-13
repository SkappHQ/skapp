package com.skapp.community.timeplanner.repository;

import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.timeplanner.model.TimeRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface TimeRecordDao
		extends JpaRepository<TimeRecord, Long>, JpaSpecificationExecutor<TimeRecord>, TimeRecordRepository {

	Optional<TimeRecord> findByEmployeeAndDate(Employee employee, LocalDate currentDate);

	Optional<TimeRecord> findByTimeRecordIdAndEmployee(Long recordId, Employee employee);

	TimeRecord findByDateAndEmployee(LocalDate date, Employee employee);

}
