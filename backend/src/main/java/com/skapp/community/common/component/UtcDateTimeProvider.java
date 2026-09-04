package com.skapp.community.common.component;

import com.skapp.community.common.util.DateTimeUtils;
import org.springframework.data.auditing.DateTimeProvider;
import org.springframework.stereotype.Component;

import java.time.temporal.TemporalAccessor;
import java.util.Optional;

@Component("utcDateTimeProvider")
public class UtcDateTimeProvider implements DateTimeProvider {

	@Override
	public Optional<TemporalAccessor> getNow() {
		return Optional.of(DateTimeUtils.getCurrentUtcDateTime());
	}

}
