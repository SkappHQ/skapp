package com.skapp.enterprise.timeplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.timeplanner.payload.request.EpAddTimeRecordDto;

public interface EpTimeService {

	ResponseEntityDto addTimeRecordWithLocation(EpAddTimeRecordDto epAddTimeRecordDto);

}
