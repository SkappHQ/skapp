package com.skapp.enterprise.invoice.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import jakarta.servlet.http.HttpServletRequest;

public interface ProjectService {

	ResponseEntityDto getAllProjects(HttpServletRequest request);

}
