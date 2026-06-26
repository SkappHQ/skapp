package com.skapp.community.timeplanner.repository;

import com.skapp.community.timeplanner.model.TimeRecord;
import com.skapp.community.timeplanner.model.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimeSlotDao extends JpaRepository<TimeSlot, Long>, TimeSlotRepository {

	Optional<TimeSlot> findByTimeRecordAndIsActiveRightNow(TimeRecord timeRecord, boolean isActive);

	List<TimeSlot> findTimeSlotByTimeRecord(TimeRecord timeRecord);

}
