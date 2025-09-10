package com.skapp.enterprise.invoice.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.constant.InvoiceMessageConstant;
import com.skapp.enterprise.invoice.mapper.CustomerMapper;
import com.skapp.enterprise.invoice.model.Customer;
import com.skapp.enterprise.invoice.model.Project;
import com.skapp.enterprise.invoice.payload.request.CustomerCreateRequestDto;
import com.skapp.enterprise.invoice.payload.request.CustomerFilterDto;
import com.skapp.enterprise.invoice.payload.response.CustomerDetailedResponseDto;
import com.skapp.enterprise.invoice.repository.CustomerDao;
import com.skapp.enterprise.invoice.repository.ProjectDao;
import com.skapp.enterprise.invoice.repository.projection.CustomerSummaryData;
import com.skapp.enterprise.invoice.service.CustomerService;
import com.skapp.enterprise.invoice.service.CustomerValidationService;
import com.skapp.enterprise.invoice.type.CurrencyType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

	private final CustomerDao customerDao;

	private final CustomerMapper customerMapper;

	private final ProjectDao projectDao;

	private final CustomerValidationService customerValidationService;

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

	@Override
	public ResponseEntityDto getAllCustomers(CustomerFilterDto customerFilterDto) {

		Pageable pageable = PageRequest.of(customerFilterDto.getPage(), customerFilterDto.getSize(),
				Sort.by(customerFilterDto.getSortOrder(), customerFilterDto.getSortKey().toString()));

		Page<Customer> customerPage = customerDao.findAllCustomers(customerFilterDto, pageable);

		List<CustomerSummaryData> mappedCustomerData = customerPage.getContent()
			.stream()
			.map(customerMapper::customerToCustomerSummaryData)
			.toList();

		PageDto pageDto = new PageDto();
		pageDto.setItems(mappedCustomerData);
		pageDto.setCurrentPage(customerPage.getNumber());
		pageDto.setTotalItems(customerPage.getTotalElements());
		pageDto.setTotalPages(customerPage.getTotalPages());

		return new ResponseEntityDto(false, pageDto);
	}

	private Customer initializeCustomer(CustomerCreateRequestDto customerCreateRequestDto) {

		Customer customer = new Customer();

		customerValidationService.validateCustomerName(customerCreateRequestDto.getCustomerName());
		customer.setName(customerCreateRequestDto.getCustomerName());
		customer.setCurrency(CurrencyType.USD);

		if (customerCreateRequestDto.getCustomerBillingDetails() != null) {
			customer.setEmail(customerCreateRequestDto.getCustomerBillingDetails().getEmail());

			// validate if the email pattern is a valid email & check if email already
			// exists
			customerValidationService
				.validateCustomerBillingDetails(customerCreateRequestDto.getCustomerBillingDetails());

			customer.setAddress(customerCreateRequestDto.getCustomerBillingDetails().getAddress());
			customer.setCountry(customerCreateRequestDto.getCustomerBillingDetails().getCountry());
			customer.setCurrency(customerCreateRequestDto.getCustomerBillingDetails().getCurrency() != null
					? customerCreateRequestDto.getCustomerBillingDetails().getCurrency() : CurrencyType.USD);
		}

		return customer;
	}

	private List<Project> initializeCustomerProjectMapping(Customer customer, List<Long> projectIds) {

		List<Project> existingProjects = projectDao.findByProjectIdIn(projectIds);

		Map<Long, Project> projectMap = existingProjects.stream()
			.collect(Collectors.toMap(Project::getProjectId, project -> project));

		List<Project> projectList = new ArrayList<>();

		for (Long projId : projectIds) {
			// Validate if the project is already mapped to any other customer
			Project existingProject = projectMap.get(projId);
			if (existingProject != null && existingProject.getCustomer() != null) {
				throw new ModuleException(
						InvoiceMessageConstant.INVOICE_ERROR_VALIDATION_CUSTOMER_PROJECT_MAPPING_INVALID);
			}

			// Create and map the project
			Project project = new Project();
			project.setCustomer(customer);
			project.setProjectId(projId);

			projectList.add(project);
		}

		return projectList;
	}

}
