package com.skapp.enterprise.invoice.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.constant.InvoiceMessageConstant;
import com.skapp.enterprise.invoice.mapper.ProjectMapper;
import com.skapp.enterprise.invoice.model.Customer;
import com.skapp.enterprise.invoice.model.Project;
import com.skapp.enterprise.invoice.model.ProjectKey;
import com.skapp.enterprise.invoice.payload.request.InternalProjectCreationRequestDto;
import com.skapp.enterprise.invoice.payload.response.project.InternalProjectCreationResponseDto;
import com.skapp.enterprise.invoice.repository.CustomerDao;
import com.skapp.enterprise.invoice.repository.ProjectDao;
import com.skapp.enterprise.invoice.service.InternalProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InternalProjectServiceImpl implements InternalProjectService {

	private final CustomerDao customerDao;

	private final ProjectDao projectDao;

	private final ProjectMapper projectMapper;

	@Override
	public ResponseEntityDto createProjectForCustomer(
			InternalProjectCreationRequestDto internalProjectCreationRequestDto) {

		Optional<Customer> optionalCustomer = customerDao.findById(internalProjectCreationRequestDto.getCustomerId());

		if (optionalCustomer.isEmpty()) {
			throw new EntityNotFoundException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_NOT_FOUND);
		}

		Project savedProject = projectDao
			.save(initializeProjectMapping(optionalCustomer.get(), internalProjectCreationRequestDto.getProjectId()));

		InternalProjectCreationResponseDto responseDto = projectMapper
			.projectToInternalProjectCreationResponseDto(savedProject);

		return new ResponseEntityDto(false, responseDto);

	}

	private Project initializeProjectMapping(Customer customer, Long projectId) {

		Optional<Project> existingProjectsOpt = projectDao.findById_ProjectId(projectId);

		if (existingProjectsOpt.isEmpty()) {
			throw new ModuleException(InvoiceMessageConstant.INVOICE_ERROR_VALIDATION_CUSTOMER_PROJECT_MAPPING_INVALID);
		}

		ProjectKey projectKey = new ProjectKey();
		projectKey.setProjectId(projectId);
		projectKey.setCustomer(customer);

		// Create and map the project
		Project project = new Project();
		project.setId(projectKey);

		return project;
	}

}
