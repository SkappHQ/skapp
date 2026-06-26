package com.skapp.community.peopleplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.payload.request.HolidayBulkRequestDto;
import com.skapp.community.peopleplanner.payload.request.HolidayFilterDto;
import com.skapp.community.peopleplanner.payload.request.HolidaysDeleteRequestDto;

import java.time.LocalDate;

public interface HolidayService {

	ResponseEntityDto getAllHolidays(HolidayFilterDto holidayFilterDto);

	ResponseEntityDto saveBulkHolidays(HolidayBulkRequestDto holidayBulkRequestDto);

	ResponseEntityDto getHolidaysByDate(LocalDate date);

	ResponseEntityDto deleteAllHolidays(int year);

	ResponseEntityDto deleteSelectedHolidays(HolidaysDeleteRequestDto holidayDeleteDto);

}
