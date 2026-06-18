package com.skapp.community.peopleplanner.repository;

import com.skapp.community.peopleplanner.model.Holiday;
import com.skapp.community.peopleplanner.payload.request.HolidayFilterDto;
import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface HolidayRepository {

	Page<Holiday> findAllHolidays(HolidayFilterDto holidayFilterDto, Pageable pageable);

	List<Holiday> findAllActiveHolidaysByDateWithWorkLocations(LocalDate date);

	List<Holiday> findAllActiveHolidaysByWorkLocationId(Long workLocationId);

}
