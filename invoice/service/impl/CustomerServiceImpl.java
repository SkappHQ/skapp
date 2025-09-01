package com.skapp.enterprise.invoice.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.util.Validations;
import com.skapp.enterprise.invoice.constant.InvoiceMessageConstant;
import com.skapp.enterprise.invoice.mapper.CustomerMapper;
import com.skapp.enterprise.invoice.model.Customer;
import com.skapp.enterprise.invoice.model.Project;
import com.skapp.enterprise.invoice.payload.request.CustomerCreateRequestDto;
import com.skapp.enterprise.invoice.payload.response.CustomerDetailedResponseDto;
import com.skapp.enterprise.invoice.repository.CustomerDao;
import com.skapp.enterprise.invoice.repository.ProjectDao;
import com.skapp.enterprise.invoice.service.CustomerService;
import com.skapp.enterprise.invoice.type.CurrencyType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

	private final CustomerDao customerDao;

	private final CustomerMapper customerMapper;

	private final ProjectDao projectDao;

	@Override
	public ResponseEntityDto createCustomer(CustomerCreateRequestDto customerCreateRequestDto) {

		Customer customer = initializeCustomer(customerCreateRequestDto);

		if (customerCreateRequestDto.getProjectIds() != null) {
			customer.setProjects(initializeCustomerProjectMapping(customer, customerCreateRequestDto.getProjectIds()));
		}

		Customer saved = customerDao.save(customer);
		CustomerDetailedResponseDto responseDto = customerMapper.customerToCustomerDetailedResponseDto(saved);

		return new ResponseEntityDto(false, responseDto);

	}

	private Customer initializeCustomer(CustomerCreateRequestDto customerCreateRequestDto) {

		Customer customer = new Customer();
		customer.setName(customerCreateRequestDto.getCustomerName());
		customer.setCurrency(CurrencyType.USD);

		if (customerCreateRequestDto.getBillingDetails() != null) {
			customer.setEmail(customerCreateRequestDto.getBillingDetails().getEmail());

			// validate if the email pattern is a valid email & check if email already
			// exists
			validateCustomerEmail(customer.getEmail());

			customer.setAddress(customerCreateRequestDto.getBillingDetails().getAddress());
			customer.setCountry(customerCreateRequestDto.getBillingDetails().getCountry());
			customer.setCurrency(customerCreateRequestDto.getBillingDetails().getCurrency() != null
					? customerCreateRequestDto.getBillingDetails().getCurrency() : CurrencyType.USD);
		}

		return customer;
	}

	private List<Project> initializeCustomerProjectMapping(Customer customer, List<Long> projectIds) {

		List<Project> projectList = new ArrayList<>();

		projectIds.forEach(projId -> {
			// validate if the project is already mapped to any other customer
			validateProjectToCustomer(projId);
			Project project = new Project();
			project.setCustomer(customer);
			project.setProjectId(projId);

			projectList.add(project);
		});

		return projectList;
	}

	private void validateProjectToCustomer(Long projectId) {

		Project project = projectDao.findByProjectId(projectId).orElse(null);
		if (project != null && project.getCustomer() != null) {
			throw new ModuleException(InvoiceMessageConstant.INVOICE_ERROR_VALIDATION_CUSTOMER_PROJECT_MAPPING_INVALID);
		}
	}

	private void validateCustomerEmail(String email) {

		if (email != null) {
			Validations.validateEmail(email);

			if (customerDao.existsByEmail(email)) {
				throw new ModuleException(
						InvoiceMessageConstant.INVOICE_ERROR_VALIDATION_CUSTOMER_EMAIL_ALREADY_EXISTS);
			}
		}

	}

}
