package com.skapp.community.common.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.payload.request.WorkLocationFilterDto;
import com.skapp.community.common.payload.request.WorkLocationRequestDto;

public interface WorkLocationService {

	ResponseEntityDto createWorkLocation(WorkLocationRequestDto workLocationRequestDto);

	ResponseEntityDto updateWorkLocation(Long id, WorkLocationRequestDto workLocationRequestDto);

	ResponseEntityDto deleteWorkLocation(Long id);

	ResponseEntityDto getWorkLocations(WorkLocationFilterDto workLocationFilterDto);

	ResponseEntityDto getAllWorkLocations();

	ResponseEntityDto getWorkLocationById(Long id);

	ResponseEntityDto checkWorkLocationNameExists(String name);

}