package com.skapp.enterprise.invoice.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.payload.request.ProjectFilterDto;
import jakarta.servlet.http.HttpServletRequest;

public interface ProjectService {

	ResponseEntityDto getAllProjects(ProjectFilterDto projectFilterDto, HttpServletRequest request);

}
