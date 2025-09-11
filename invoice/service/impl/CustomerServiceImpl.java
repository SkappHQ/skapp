package com.skapp.enterprise.invoice.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.enterprise.invoice.constant.InvoiceMessageConstant;
import com.skapp.enterprise.invoice.mapper.CustomerMapper;
import com.skapp.enterprise.invoice.model.Customer;
import com.skapp.enterprise.invoice.model.CustomerContact;
import com.skapp.enterprise.invoice.model.Project;
import com.skapp.enterprise.invoice.payload.request.CustomerCreateRequestDto;
import com.skapp.enterprise.invoice.payload.request.CustomerFilterDto;
import com.skapp.enterprise.invoice.payload.request.CustomerStatusUpdateRequestDto;
import com.skapp.enterprise.invoice.payload.request.customer.CustomerContactDetailsDto;
import com.skapp.enterprise.invoice.payload.response.CustomerContactResponseDto;
import com.skapp.enterprise.invoice.payload.response.CustomerDetailedResponseDto;
import com.skapp.enterprise.invoice.repository.CustomerContactDao;
import com.skapp.enterprise.invoice.repository.CustomerDao;
import com.skapp.enterprise.invoice.repository.ProjectDao;
import com.skapp.enterprise.invoice.repository.projection.CustomerSummaryData;
import com.skapp.enterprise.invoice.service.CustomerService;
import com.skapp.enterprise.invoice.service.CustomerValidationService;
import com.skapp.enterprise.invoice.type.CurrencyType;
import com.skapp.enterprise.invoice.type.CustomerStatus;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotNull;
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
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

	private final CustomerDao customerDao;

	private final CustomerMapper customerMapper;

	private final ProjectDao projectDao;

	private final CustomerContactDao customerContactDao;

	private final CustomerValidationService customerValidationService;

	private final MessageUtil messageUtil;

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

		Pageable pageable = customerFilterDto.getSize() <= 0
				? Pageable.unpaged()
				: PageRequest.of(customerFilterDto.getPage(), customerFilterDto.getSize(),
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

	@Override
	public ResponseEntityDto getCustomerById(@NotNull Long id) {

		Customer customer = customerDao.findById(id)
			.orElseThrow(() -> new EntityNotFoundException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_NOT_FOUND));

		CustomerDetailedResponseDto responseDto = customerMapper.customerToCustomerDetailedResponseDto(customer);

		return new ResponseEntityDto(false, responseDto);

	}

	@Override
	@Transactional
	public ResponseEntityDto updateCustomer(Long id, CustomerCreateRequestDto customerCreateRequestDto) {

		Optional<Customer> optionalCustomer = customerDao.findById(id);

		if (optionalCustomer.isEmpty()) {
			throw new EntityNotFoundException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_NOT_FOUND);
		}

		Customer customer = optionalCustomer.get();

		if (customerCreateRequestDto.getCustomerName() != null) {
			customerValidationService.validateCustomerName(customerCreateRequestDto.getCustomerName());
			customer.setName(customerCreateRequestDto.getCustomerName());
		}

		if (customerCreateRequestDto.getCustomerBillingDetails() != null) {
			if (customerCreateRequestDto.getCustomerBillingDetails().getEmail() != null) {
				customerValidationService
					.validateCustomerBillingDetails(customerCreateRequestDto.getCustomerBillingDetails());
				customer.setEmail(customerCreateRequestDto.getCustomerBillingDetails().getEmail());
			}
			if (customerCreateRequestDto.getCustomerBillingDetails().getAddress() != null) {
				customer.setAddress(customerCreateRequestDto.getCustomerBillingDetails().getAddress());
			}
			if (customerCreateRequestDto.getCustomerBillingDetails().getCountry() != null) {
				customer.setCountry(customerCreateRequestDto.getCustomerBillingDetails().getCountry());
			}
			if (customerCreateRequestDto.getCustomerBillingDetails().getCurrency() != null) {
				customer.setCurrency(customerCreateRequestDto.getCustomerBillingDetails().getCurrency());
			}

		}

		Customer saved = customerDao.save(customer);
		CustomerDetailedResponseDto responseDto = customerMapper.customerToCustomerDetailedResponseDto(saved);

		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	@Transactional
	public ResponseEntityDto updateCustomerStatus(Long id,
			CustomerStatusUpdateRequestDto customerStatusUpdateRequestDto) {

		Optional<Customer> optionalCustomer = customerDao.findById(id);

		if (optionalCustomer.isEmpty()) {
			throw new EntityNotFoundException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_NOT_FOUND);
		}

		Customer customer = optionalCustomer.get();
		customer.setStatus(customerStatusUpdateRequestDto.getStatus());

		Customer saved = customerDao.save(customer);
		CustomerDetailedResponseDto responseDto = customerMapper.customerToCustomerDetailedResponseDto(saved);

		return new ResponseEntityDto(false, responseDto);

	}

	@Override
	public ResponseEntityDto createCustomerContact(CustomerContactDetailsDto customerContactDetailsDto) {

		Optional<Customer> optionalCustomer = customerDao.findById(customerContactDetailsDto.getCustomerId());

		if (optionalCustomer.isEmpty()) {
			throw new EntityNotFoundException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_NOT_FOUND);
		}

		Customer customer = optionalCustomer.get();

		customerValidationService.validateCustomerContactRequiredFields(customerContactDetailsDto, null);
		customerValidationService.validateCustomerContactDetails(customerContactDetailsDto, null);

		CustomerContact customerContact = customerMapper
			.customerContactDetailsDtoToCustomerContact(customerContactDetailsDto);
		customerContact.setIsActive(true);
		customerContact.setCustomer(customer);

		CustomerContact savedContact = customerContactDao.save(customerContact);
		CustomerContactResponseDto responseDto = customerMapper
			.customerContactToCustomerContactResponseDto(savedContact);

		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	@Transactional
	public ResponseEntityDto updateCustomerContact(Long id, CustomerContactDetailsDto customerContactDetailsDto) {

		Optional<CustomerContact> optionalCustomerContact = customerContactDao.findByIdAndIsActive(id, true);

		if (optionalCustomerContact.isEmpty()) {
			throw new EntityNotFoundException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_CONTACT_NOT_FOUND);
		}

		CustomerContact customerContact = optionalCustomerContact.get();

		customerValidationService.validateCustomerContactRequiredFields(customerContactDetailsDto, customerContact);
		customerValidationService.validateCustomerContactDetails(customerContactDetailsDto, customerContact);

		if (customerContactDetailsDto.getContactName() != null) {
			customerContact.setName(customerContactDetailsDto.getContactName());
		}

		if (customerContactDetailsDto.getEmail() != null) {
			customerContact.setEmail(customerContactDetailsDto.getEmail());
		}

		if (customerContactDetailsDto.getContactNo() != null) {
			customerContact.setContactNo(customerContactDetailsDto.getContactNo());
		}

		if (customerContactDetailsDto.getJobTitle() != null) {
			customerContact.setJobTitle(customerContactDetailsDto.getJobTitle());
		}

		CustomerContact savedContact = customerContactDao.save(customerContact);
		CustomerContactResponseDto responseDto = customerMapper
			.customerContactToCustomerContactResponseDto(savedContact);

		return new ResponseEntityDto(false, responseDto);

	}

	@Override
	@Transactional
	public ResponseEntityDto deleteCustomerContact(Long id) {

		Optional<CustomerContact> optionalCustomerContact = customerContactDao.findByIdAndIsActive(id, true);

		if (optionalCustomerContact.isEmpty()) {
			throw new EntityNotFoundException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_CONTACT_NOT_FOUND);
		}

		CustomerContact customerContact = optionalCustomerContact.get();

		customerContact.setIsActive(false);
		customerContactDao.save(customerContact);

		return new ResponseEntityDto(
				messageUtil.getMessage(InvoiceMessageConstant.INVOICE_SUCCESS_DELETE_CUSTOMER_CONTACT), false);

	}

	private Customer initializeCustomer(CustomerCreateRequestDto customerCreateRequestDto) {

		Customer customer = new Customer();

		customerValidationService.validateCustomerName(customerCreateRequestDto.getCustomerName());
		customer.setName(customerCreateRequestDto.getCustomerName());
		customer.setCurrency(CurrencyType.USD);
		customer.setStatus(CustomerStatus.ACTIVE);

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
