package com.skapp.community.peopleplanner.repository;

import com.skapp.community.common.model.WorkLocation;
import com.skapp.community.peopleplanner.model.Holiday;
import com.skapp.community.peopleplanner.payload.request.HolidayFilterDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface HolidayRepository {

	Page<Holiday> findAllHolidays(HolidayFilterDto holidayFilterDto, Pageable pageable);

	Page<Holiday> findAllHolidaysForWorkLocation(HolidayFilterDto holidayFilterDto, WorkLocation workLocation,
			Pageable pageable);

	List<Holiday> findAllActiveHolidaysForWorkLocation(WorkLocation workLocation);

	List<Holiday> findAllActiveHolidaysBetweenForWorkLocation(LocalDate startDate, LocalDate endDate,
			WorkLocation workLocation);

	List<Holiday> findAllActiveHolidaysByDateWithWorkLocations(LocalDate date);

	List<Holiday> findAllActiveHolidaysBetweenWithWorkLocations(LocalDate startDate, LocalDate endDate);

	List<Holiday> findAllActiveHolidaysByDateAndWorkLocationId(LocalDate date, Long workLocationId);

	List<Holiday> findFutureActiveHolidaysExclusiveToWorkLocation(Long workLocationId, LocalDate fromDate);

}
