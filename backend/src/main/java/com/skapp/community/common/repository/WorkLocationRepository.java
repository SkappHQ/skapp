package com.skapp.community.common.repository;

import com.skapp.community.common.model.WorkLocation;
import com.skapp.community.common.payload.request.WorkLocationFilterDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface WorkLocationRepository {

	Page<WorkLocation> findWorkLocations(WorkLocationFilterDto workLocationFilterDto, Pageable pageable);

}
