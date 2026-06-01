package com.skapp.enterprise.timeplanner.repository;

import com.skapp.community.timeplanner.model.TimeRecord;
import com.skapp.enterprise.timeplanner.model.TimeRecordLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimeRecordLocationDao extends JpaRepository<TimeRecordLocation, Long> {

	Optional<TimeRecordLocation> findByTimeRecord(TimeRecord timeRecord);

	void deleteAllByTimeRecordTimeRecordIdIn(List<Long> timeRecordIds);

}
