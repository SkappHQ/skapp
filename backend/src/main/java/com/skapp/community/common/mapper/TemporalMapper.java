package com.skapp.community.common.mapper;

import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.util.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class TemporalMapper {

	private final TimeZoneService timeZoneService;

	public LocalDate toBusinessDate(Instant instant) {
		return instant == null ? null : DateTimeUtils.toDateAt(instant, timeZoneService.business());
	}

}
