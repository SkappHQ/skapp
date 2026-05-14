package com.skapp.enterprise.pm.service;

import com.skapp.enterprise.common.payload.request.ProjectRequestDto;

import java.util.List;

public interface EpProjectService {

	List<ProjectRequestDto> getProjectsByIds(List<Long> projectIds);

}
