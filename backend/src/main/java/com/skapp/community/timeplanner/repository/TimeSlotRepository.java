package com.skapp.community.timeplanner.repository;

import com.skapp.community.timeplanner.model.TimeSlot;
import com.skapp.community.timeplanner.payload.request.TimeSlotFilterDto;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimeSlotRepository {

	Page<TimeSlot> getTimeSlotsByTimePeriod(TimeSlotFilterDto timeSlotFilterDto);

	List<TimeSlot> getFullyAndPartiallyOverlappingSlots(Long recordId, Long startTime, Long endTime);

	List<TimeSlot> getNotFullyOverlappingSlots(Long recordId, Long startTime, Long endTime);

}
