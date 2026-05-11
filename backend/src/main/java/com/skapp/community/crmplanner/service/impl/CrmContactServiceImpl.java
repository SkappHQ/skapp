package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.ValidationException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.payload.request.CrmContactCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmContactOwnerFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmCompanySummaryResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmContactOwnerResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmContactResponseDto;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmContactOwnerRepository;
import com.skapp.community.crmplanner.service.CrmContactService;
import com.skapp.community.crmplanner.service.CrmContactValidationService;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmContactServiceImpl implements CrmContactService {

	private static final Set<Role> ASSIGNABLE_CRM_ROLES = Set.of(Role.CRM_ADMIN, Role.CRM_SALES_MANAGER,
			Role.CRM_SALES_REPRESENTATIVE);

	private final CrmContactDao crmContactDao;

	private final CrmCompanyDao crmCompanyDao;

	private final EmployeeDao employeeDao;

	private final CrmContactOwnerRepository crmContactOwnerRepository;

	private final CrmContactValidationService crmContactValidationService;

	private final UserService userService;

	@Override
	@Transactional
	public ResponseEntityDto createContact(CrmContactCreateRequestDto requestDto) {
		log.info("createContact: execution started");

		User currentUser = userService.getCurrentUser();
		crmContactValidationService.validateCreateContactRequest(requestDto);

		CrmCompany company = resolveCompany(requestDto.getCompanyId());
		Employee owner = resolveOwner(requestDto.getOwnerId(), currentUser);

		CrmContact contact = new CrmContact();
		contact.setName(requestDto.getName().trim());
		contact.setEmail(requestDto.getEmail().trim().toLowerCase());
		contact.setContactNumber(normalizeNullableText(requestDto.getContactNumber()));
		contact.setCompany(company);
		contact.setOwner(owner);
		contact.setIsDeleted(false);

		CrmContact savedContact = crmContactDao.save(contact);

		log.info("createContact: execution ended");
		return new ResponseEntityDto(false, mapContactToResponseDto(savedContact));
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getContactOwners(CrmContactOwnerFilterDto filterDto) {
		log.info("getContactOwners: execution started");

		Pageable pageable = PageRequest.of(filterDto.getPage(), filterDto.getSize());
		Page<Employee> contactOwnerPage = crmContactOwnerRepository.findContactOwners(filterDto, pageable);

		List<CrmContactOwnerResponseDto> ownerResponseDtos = contactOwnerPage.getContent()
			.stream()
			.map(this::mapOwnerToResponseDto)
			.toList();

		PageDto pageDto = new PageDto();
		pageDto.setItems(ownerResponseDtos);
		pageDto.setCurrentPage(contactOwnerPage.getNumber());
		pageDto.setTotalItems(contactOwnerPage.getTotalElements());
		pageDto.setTotalPages(contactOwnerPage.getTotalPages());

		log.info("getContactOwners: execution ended");
		return new ResponseEntityDto(false, pageDto);
	}

	private CrmCompany resolveCompany(Long companyId) {
		if (companyId == null) {
			return null;
		}

		return crmCompanyDao.findByIdAndIsDeletedFalse(companyId)
			.orElseThrow(() -> new ValidationException(CrmMessageConstant.CRM_ERROR_COMPANY_NOT_FOUND));
	}

	private Employee resolveOwner(Long ownerId, User currentUser) {
		Employee currentEmployee = currentUser.getEmployee();
		if (currentEmployee == null) {
			throw new ValidationException(CrmMessageConstant.CRM_ERROR_OWNER_NOT_FOUND);
		}

		EmployeeRole currentEmployeeRole = currentEmployee.getEmployeeRole();
		boolean isSuperAdmin = currentEmployeeRole != null && Boolean.TRUE.equals(currentEmployeeRole.getIsSuperAdmin());
		Role currentCrmRole = currentEmployeeRole != null ? currentEmployeeRole.getCrmRole() : null;

		if (currentCrmRole == Role.CRM_SALES_REPRESENTATIVE) {
			if (ownerId != null && !ownerId.equals(currentEmployee.getEmployeeId())) {
				throw new ValidationException(CrmMessageConstant.CRM_ERROR_OWNER_ASSIGNMENT_DENIED);
			}
			return currentEmployee;
		}

		if (ownerId == null) {
			return currentEmployee;
		}

		if (!isSuperAdmin && currentCrmRole != Role.CRM_ADMIN && currentCrmRole != Role.CRM_SALES_MANAGER) {
			throw new ValidationException(CrmMessageConstant.CRM_ERROR_OWNER_ASSIGNMENT_DENIED);
		}

		return validateAssignableOwner(ownerId);
	}

	private Employee validateAssignableOwner(Long ownerId) {
		Employee owner = employeeDao.findById(ownerId)
			.orElseThrow(() -> new ValidationException(CrmMessageConstant.CRM_ERROR_OWNER_NOT_FOUND));

		if (owner.getUser() == null || !Boolean.TRUE.equals(owner.getUser().getIsActive())) {
			throw new ValidationException(CrmMessageConstant.CRM_ERROR_OWNER_INACTIVE);
		}

		EmployeeRole ownerRole = owner.getEmployeeRole();
		Role ownerCrmRole = ownerRole != null ? ownerRole.getCrmRole() : null;
		if (!ASSIGNABLE_CRM_ROLES.contains(ownerCrmRole)) {
			throw new ValidationException(CrmMessageConstant.CRM_ERROR_OWNER_INVALID_ROLE);
		}

		return owner;
	}

	private String normalizeNullableText(String value) {
		return value == null || value.trim().isEmpty() ? null : value.trim();
	}

	private CrmContactResponseDto mapContactToResponseDto(CrmContact contact) {
		CrmContactResponseDto responseDto = new CrmContactResponseDto();
		responseDto.setId(contact.getId());
		responseDto.setName(contact.getName());
		responseDto.setEmail(contact.getEmail());
		responseDto.setContactNumber(contact.getContactNumber());

		if (contact.getCompany() != null) {
			responseDto.setCompany(mapCompanyToSummaryResponseDto(contact.getCompany()));
		}

		responseDto.setOwner(mapOwnerToResponseDto(contact.getOwner()));
		return responseDto;
	}

	private CrmCompanySummaryResponseDto mapCompanyToSummaryResponseDto(CrmCompany company) {
		CrmCompanySummaryResponseDto responseDto = new CrmCompanySummaryResponseDto();
		responseDto.setId(company.getId());
		responseDto.setName(company.getName());
		return responseDto;
	}

	private CrmContactOwnerResponseDto mapOwnerToResponseDto(Employee owner) {
		CrmContactOwnerResponseDto responseDto = new CrmContactOwnerResponseDto();
		responseDto.setEmployeeId(owner.getEmployeeId());
		responseDto.setFirstName(owner.getFirstName());
		responseDto.setLastName(owner.getLastName());
		if (owner.getUser() != null) {
			responseDto.setEmail(owner.getUser().getEmail());
		}
		if (owner.getEmployeeRole() != null) {
			responseDto.setCrmRole(owner.getEmployeeRole().getCrmRole());
		}
		return responseDto;
	}

}
