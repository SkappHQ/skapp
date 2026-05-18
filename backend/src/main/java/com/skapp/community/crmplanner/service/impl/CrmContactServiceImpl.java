package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.ValidationException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.payload.request.CrmContactCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmContactOwnerFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmContactOwnerResponseDto;
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

import java.util.Locale;
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

	private final CrmMapper crmMapper;

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
		contact.setEmail(requestDto.getEmail().trim().toLowerCase(Locale.ROOT));
		contact.setContactNumber(normalizeNullableText(requestDto.getContactNumber()));
		contact.setCompany(company);
		contact.setOwner(owner);
		contact.setIsDeleted(false);

		CrmContact savedContact = crmContactDao.save(contact);

		log.info("createContact: execution ended");
		return new ResponseEntityDto(false, crmMapper.crmContactToCrmContactResponseDto(savedContact));
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getContactOwners(CrmContactOwnerFilterDto filterDto) {
		log.info("getContactOwners: execution started");

		Pageable pageable = PageRequest.of(filterDto.getPage(), filterDto.getSize());
		Page<Employee> contactOwnerPage = crmContactOwnerRepository.findContactOwners(filterDto, pageable);

		List<CrmContactOwnerResponseDto> ownerResponseDtos = contactOwnerPage.getContent()
			.stream()
			.map(crmMapper::employeeToCrmContactOwnerResponseDto)
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
		boolean isSuperAdmin = currentEmployeeRole != null
				&& Boolean.TRUE.equals(currentEmployeeRole.getIsSuperAdmin());
		Role currentCrmRole = currentEmployeeRole != null ? currentEmployeeRole.getCrmRole() : null;

		if (currentCrmRole == Role.CRM_SALES_REPRESENTATIVE && !isSuperAdmin) {
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
		boolean isOwnerSuperAdmin = ownerRole != null && Boolean.TRUE.equals(ownerRole.getIsSuperAdmin());
		Role ownerCrmRole = ownerRole != null ? ownerRole.getCrmRole() : null;
		if (!isOwnerSuperAdmin && !ASSIGNABLE_CRM_ROLES.contains(ownerCrmRole)) {
			throw new ValidationException(CrmMessageConstant.CRM_ERROR_OWNER_INVALID_ROLE);
		}

		return owner;
	}

	private String normalizeNullableText(String value) {
		return value == null || value.trim().isEmpty() ? null : value.trim();
	}

}
