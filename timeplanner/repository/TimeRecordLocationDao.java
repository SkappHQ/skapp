package com.skapp.enterprise.timeplanner.repository;

import com.skapp.community.timeplanner.model.TimeRecord;
import com.skapp.enterprise.timeplanner.model.TimeRecordLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimeRecordLocationDao extends JpaRepository<TimeRecordLocation, Long> {

	Optional<TimeRecordLocation> findByTimeRecord(TimeRecord timeRecord);

	List<TimeRecordLocation> findByTimeRecordTimeRecordIdIn(List<Long> timeRecordIds);

	@Modifying
	@Query("DELETE FROM TimeRecordLocation trl WHERE trl.timeRecord.employee.workLocation.workLocationId = :workLocationId")
	void deleteByWorkLocationId(@Param("workLocationId") Long workLocationId);

}
