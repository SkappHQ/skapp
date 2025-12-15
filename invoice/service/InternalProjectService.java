package com.skapp.enterprise.invoice.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.payload.request.InternalProjectCreationRequestDto;

public interface InternalProjectService {

	ResponseEntityDto createProjectForCustomer(InternalProjectCreationRequestDto internalProjectCreationRequestDto);

}
