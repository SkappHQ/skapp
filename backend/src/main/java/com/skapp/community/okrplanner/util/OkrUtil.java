package com.skapp.community.okrplanner.util;

import com.skapp.community.okrplanner.model.OkrConfig;
import com.skapp.community.okrplanner.type.OkrTimePeriod;
import lombok.experimental.UtilityClass;

import java.util.List;

@UtilityClass
public class OkrUtil {

	public static Boolean isValidTimePeriod(OkrTimePeriod requestedTimePeriod, OkrConfig okrConfig) {
		if (okrConfig == null) {
			return false;
		}
		List<OkrTimePeriod> allowedTimePeriods = OkrTimePeriod.getByType(okrConfig.getFrequency());
		return allowedTimePeriods.contains(requestedTimePeriod);
	}

}
