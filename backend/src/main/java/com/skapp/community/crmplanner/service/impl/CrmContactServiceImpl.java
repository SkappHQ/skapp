package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.payload.request.CrmContactCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmContactOwnerFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmContactOwnerResponseDto;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmContactOwnerRepository;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.repository.CrmTaskDao;
import com.skapp.community.crmplanner.service.CrmContactService;
import com.skapp.community.crmplanner.util.CrmValidations;
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
import java.util.Locale;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmContactServiceImpl implements CrmContactService {

	private final CrmContactDao crmContactDao;

	private final CrmCompanyDao crmCompanyDao;

	private final CrmDealDao crmDealDao;

	private final CrmTaskDao crmTaskDao;

	private final EmployeeDao employeeDao;

	private final CrmContactOwnerRepository crmContactOwnerRepository;

	private final UserService userService;

	private final MessageUtil messageUtil;

	private final CrmMapper crmMapper;

	@Override
	@Transactional
	public ResponseEntityDto createContact(CrmContactCreateRequestDto requestDto) {
		log.info("createContact: execution started");

		User currentUser = userService.getCurrentUser();
		CrmValidations.validateContactName(requestDto.getName());
		CrmValidations.validateContactEmail(requestDto.getEmail());
		CrmValidations.validateContactNumber(requestDto.getContactNumber());
		CrmValidations.validateOwnerId(requestDto.getOwnerId());
		CrmValidations.validateCompanyId(requestDto.getCompanyId());

		CrmCompany company = crmCompanyDao.getReferenceById(requestDto.getCompanyId());
		Employee owner = resolveOwner(requestDto.getOwnerId(), currentUser);

		CrmContact contact = new CrmContact();
		contact.setName(requestDto.getName().trim());
		contact.setEmail(requestDto.getEmail().trim().toLowerCase(Locale.ROOT));
		contact.setContactNumber(normalizeNullableText(requestDto.getContactNumber()));
		contact.setCompany(company);
		contact.setOwner(owner);

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

	@Override
	@Transactional
	public ResponseEntityDto deleteContact(Long id) {
		log.info("deleteContact: execution started");

		CrmContact contact = crmContactDao.findByIdAndIsDeletedFalse(id)
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND));

		List<CrmTask> directTasks = crmTaskDao.findByContact_IdAndIsDeletedFalse(id);
		directTasks.forEach(t -> t.setIsDeleted(true));
		crmTaskDao.saveAll(directTasks);

		List<CrmTask> dealTasks = crmTaskDao.findByDeal_Contact_IdAndIsDeletedFalse(id);
		dealTasks.forEach(t -> t.setIsDeleted(true));
		crmTaskDao.saveAll(dealTasks);

		List<CrmDeal> deals = crmDealDao.findByContact_IdAndIsDeletedFalse(id);
		deals.forEach(d -> d.setIsDeleted(true));
		crmDealDao.saveAll(deals);

		contact.setIsDeleted(true);
		crmContactDao.save(contact);

		log.info("deleteContact: execution ended");
		return new ResponseEntityDto(false, messageUtil.getMessage(CrmMessageConstant.CRM_SUCCESS_CONTACT_DELETED));
	}

	private Employee resolveOwner(Long ownerId, User currentUser) {
		Employee currentEmployee = currentUser.getEmployee();
		if (currentEmployee == null) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_OWNER_NOT_FOUND);
		}

		EmployeeRole currentEmployeeRole = currentEmployee.getEmployeeRole();
		boolean isSuperAdmin = currentEmployeeRole != null
				&& Boolean.TRUE.equals(currentEmployeeRole.getIsSuperAdmin());
		Role currentCrmRole = currentEmployeeRole != null ? currentEmployeeRole.getCrmRole() : null;

		if (currentCrmRole == Role.CRM_SALES_REPRESENTATIVE && !isSuperAdmin) {
			if (!ownerId.equals(currentEmployee.getEmployeeId())) {
				throw new ModuleException(CrmMessageConstant.CRM_ERROR_OWNER_ASSIGNMENT_DENIED);
			}
			return currentEmployee;
		}

		if (!isSuperAdmin && currentCrmRole != Role.CRM_ADMIN && currentCrmRole != Role.CRM_SALES_MANAGER) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_OWNER_ASSIGNMENT_DENIED);
		}

		return validateAssignableOwner(ownerId);
	}

	private Employee validateAssignableOwner(Long ownerId) {
		Employee owner = employeeDao.findById(ownerId)
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_OWNER_NOT_FOUND));

		if (owner.getUser() == null || !Boolean.TRUE.equals(owner.getUser().getIsActive())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_OWNER_INACTIVE);
		}

		EmployeeRole ownerRole = owner.getEmployeeRole();
		boolean isOwnerSuperAdmin = ownerRole != null && Boolean.TRUE.equals(ownerRole.getIsSuperAdmin());
		Role ownerCrmRole = ownerRole != null ? ownerRole.getCrmRole() : null;
		if (!isOwnerSuperAdmin && !CrmConstants.ASSIGNABLE_CRM_ROLES.contains(ownerCrmRole)) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_OWNER_INVALID_ROLE);
		}

		return owner;
	}

	private String normalizeNullableText(String value) {
		return value == null || value.isEmpty() ? null : value;
	}

}
