package com.skapp.enterprise.common.service;

import com.skapp.enterprise.common.payload.response.EpJobResponseDto;

import java.util.List;

public interface EpJobService {

	List<EpJobResponseDto> getJobs();

}
