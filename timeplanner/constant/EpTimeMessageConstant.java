package com.skapp.enterprise.timeplanner.constant;

import com.skapp.community.common.constant.MessageConstant;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum EpTimeMessageConstant implements MessageConstant {

	EP_TIME_ERROR_GEO_FENCING_NOT_ENABLED("ep.time.error.geo-fencing-not-enabled"),
	EP_TIME_ERROR_TIME_RECORD_NOT_FOUND("ep.time.error.time-record-not-found");

	private final String messageKey;

}
