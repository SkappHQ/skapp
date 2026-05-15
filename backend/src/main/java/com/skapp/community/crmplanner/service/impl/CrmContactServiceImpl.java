package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ValidationException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.common.util.transformer.PageTransformer;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.*;
import com.skapp.community.crmplanner.payload.request.*;
import com.skapp.community.crmplanner.payload.response.*;
import com.skapp.community.crmplanner.repository.*;
import com.skapp.community.crmplanner.service.CrmContactService;
import com.skapp.community.crmplanner.service.CrmContactValidationService;
import com.skapp.community.crmplanner.type.CrmActiveDealSummary;
import com.skapp.community.crmplanner.type.CrmDealSummary;
import com.skapp.community.crmplanner.type.CrmTaskSummary;
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

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmContactServiceImpl implements CrmContactService {

	private static final Set<Role> ASSIGNABLE_CRM_ROLES = Set.of(Role.CRM_ADMIN, Role.CRM_SALES_MANAGER,
			Role.CRM_SALES_REPRESENTATIVE);

	private final CrmContactDao crmContactDao;

	private final CrmCompanyDao crmCompanyDao;

	private final CrmDealDao crmDealDao;

	private final CrmTaskDao crmTaskDao;

	private final CrmTaskTypeDao crmTaskTypeDao;

	private final CrmDealStageDao crmDealStageDao;

	private final CrmPriorityDao crmPriorityDao;

	private final CrmDealRepository crmDealRepository;

	private final CrmTaskRepository crmTaskRepository;

	private final EmployeeDao employeeDao;

	private final CrmContactOwnerRepository crmContactOwnerRepository;

	private final CrmContactRepository crmContactRepository;

	private final CrmContactValidationService crmContactValidationService;

	private final UserService userService;

	private final CrmMapper crmMapper;

	private final PageTransformer pageTransformer;

	private final MessageUtil messageUtil;

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
		return new ResponseEntityDto(false, crmMapper.crmContactToCrmContactResponseDto(savedContact));
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getContacts(CrmContactFilterDto filterDto) {
		log.info("getContacts: execution started");

		Pageable pageable = PageRequest.of(filterDto.getPage(), filterDto.getSize());

		Page<CrmContact> contactPage = crmContactRepository.findContacts(filterDto, pageable);
		PageDto pageDto = pageTransformer.transform(contactPage);

		List<CrmContact> contacts = contactPage.getContent();
		List<CrmContactListItemDto> contactDtos;

		if (contacts.isEmpty()) {
			contactDtos = Collections.emptyList();
		}
		else {
			List<Long> contactIds = contacts.stream().map(CrmContact::getId).toList();
			Map<Long, CrmDealSummary> closedDealSummary = buildClosedDealSummaryMap(contactIds);
			Map<Long, CrmActiveDealSummary> activeDealSummary = buildActiveDealSummaryMap(contactIds);
			Map<Long, CrmTaskSummary> taskSummary = buildTaskSummaryMap(contactIds);

			contactDtos = contacts.stream().map(c -> {
				CrmContactListItemDto dto = crmMapper.crmContactToCrmContactListItemDto(c);
				
				CrmDealSummary closedDeals = closedDealSummary.get(c.getId());
				dto.setClosedDealValue(closedDeals != null ? closedDeals.getTotalClosedValue() : 0.0);
				dto.setClosedDealCount(closedDeals != null ? closedDeals.getClosedDealCount() : 0L);
				
				CrmActiveDealSummary activeDeals = activeDealSummary.get(c.getId());
				dto.setPipelineDealValue(activeDeals != null ? activeDeals.getTotalPipelineValue() : 0.0);
				dto.setActiveDealCount(activeDeals != null ? activeDeals.getActiveDealsCount() : 0L);
				
				CrmTaskSummary tasks = taskSummary.get(c.getId());
				dto.setOpenTaskCount(tasks != null ? tasks.getOpenTaskCount() : 0L);
				dto.setOverdueTaskCount(tasks != null ? tasks.getOverdueTaskCount() : 0L);
				
				return dto;
			}).toList();
		}

		pageDto.setItems(contactDtos);

		log.info("getContacts: execution ended");
		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getContactById(Long id) {
		log.info("getContactById: execution started for id: {}", id);

		CrmContact contact = crmContactDao.findByIdAndIsDeletedFalse(id)
			.orElseThrow(() -> new EntityNotFoundException(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND));

		CrmContactResponseDto dto = crmMapper.crmContactToCrmContactResponseDto(contact);

		// No aggregates - basic contact info only for detail panel header
		// Frontend will call /contacts/{id}/metrics separately for metrics

		log.info("getContactById: execution ended");
		return new ResponseEntityDto(false, dto);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getContactMetrics(Long id) {
		log.info("getContactMetrics: execution started for id: {}", id);

		// Verify contact exists and is not deleted
		crmContactDao.findByIdAndIsDeletedFalse(id)
			.orElseThrow(() -> new EntityNotFoundException(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND));

		// Fetch closed deal summary (Total Revenue)
		List<CrmDealSummary> closedDeals = crmDealRepository.findClosedDealSummaryByContactIds(List.of(id));
		CrmDealSummary closedDeal = closedDeals.isEmpty() ? null : closedDeals.get(0);

		// Fetch active deal summary (Revenue on Pipeline + Active Deals Count)
		List<CrmActiveDealSummary> activeDeals = crmDealRepository.findActiveDealSummaryByContactIds(List.of(id));
		CrmActiveDealSummary activeDeal = activeDeals.isEmpty() ? null : activeDeals.get(0);

		// Fetch task summary (Open Tasks + Overdue Tasks)
		List<CrmTaskSummary> tasks = crmTaskRepository.findOpenTaskSummaryByContactIds(List.of(id));
		CrmTaskSummary task = tasks.isEmpty() ? null : tasks.get(0);

		CrmContactMetricsResponseDto metrics = new CrmContactMetricsResponseDto();
		metrics.setTotalRevenue(closedDeal != null ? closedDeal.getTotalClosedValue() : 0.0);
		metrics.setRevenueOnPipeline(activeDeal != null ? activeDeal.getTotalPipelineValue() : 0.0);
		metrics.setActiveDealsCount(activeDeal != null ? activeDeal.getActiveDealsCount() : 0L);
		metrics.setOpenTasksCount(task != null ? task.getOpenTaskCount() : 0L);
		metrics.setOverdueTasksCount(task != null ? task.getOverdueTaskCount() : 0L);

		log.info("getContactMetrics: execution ended");
		return new ResponseEntityDto(false, metrics);
	}

	@Override
	@Transactional
	public ResponseEntityDto updateContact(Long id, CrmContactUpdateRequestDto requestDto) {
		log.info("updateContact: execution started for id: {}", id);

		User currentUser = userService.getCurrentUser();
		CrmContact contact = crmContactDao.findByIdAndIsDeletedFalse(id)
			.orElseThrow(() -> new EntityNotFoundException(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND));

		enforceEditPermission(contact, currentUser);
		crmContactValidationService.validateUpdateContactRequest(requestDto, id);

		contact.setName(requestDto.getName().trim());
		contact.setEmail(requestDto.getEmail().trim().toLowerCase());
		contact.setContactNumber(normalizeNullableText(requestDto.getContactNumber()));
		contact.setCompany(resolveCompany(requestDto.getCompanyId()));

		if (requestDto.getOwnerId() != null) {
			Employee newOwner = resolveOwner(requestDto.getOwnerId(), currentUser);
			contact.setOwner(newOwner);
		}

		crmContactDao.save(contact);

		log.info("updateContact: execution ended");
		return new ResponseEntityDto(messageUtil.getMessage(CrmMessageConstant.CRM_SUCCESS_CONTACT_UPDATED), false);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getContactDeals(Long contactId) {
		log.info("getContactDeals: execution started for contactId: {}", contactId);

		// Verify contact exists and is not deleted
		crmContactDao.findByIdAndIsDeletedFalse(contactId)
			.orElseThrow(() -> new EntityNotFoundException(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND));

		List<CrmDealResponseDto> deals = crmDealDao.findByContactIdAndIsDeletedFalse(contactId)
			.stream()
			.map(crmMapper::crmDealToCrmDealResponseDto)
			.toList();

		log.info("getContactDeals: execution ended with {} deals", deals.size());
		return new ResponseEntityDto(false, deals);
	}

	@Override
	@Transactional
	public ResponseEntityDto createContactTask(Long contactId, CrmTaskCreateRequestDto requestDto) {
		log.info("createContactTask: execution started for contactId: {}", contactId);

		User currentUser = userService.getCurrentUser();

		// Verify contact exists
		CrmContact contact = crmContactDao.findByIdAndIsDeletedFalse(contactId)
			.orElseThrow(() -> new EntityNotFoundException(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND));

		// Resolve task type
		CrmTaskType taskType = crmTaskTypeDao.findById(requestDto.getTypeId())
			.orElseThrow(() -> new EntityNotFoundException(CrmMessageConstant.CRM_ERROR_TASK_TYPE_NOT_FOUND));

		// Resolve priority
		CrmPriority priority = crmPriorityDao.findById(requestDto.getPriorityId())
			.orElseThrow(() -> new EntityNotFoundException(CrmMessageConstant.CRM_ERROR_PRIORITY_NOT_FOUND));

		// Resolve owner (defaults to current user)
		Employee owner = resolveOwner(requestDto.getOwnerId(), currentUser);

		// Resolve deal if provided
		CrmDeal deal = null;
		if (requestDto.getDealId() != null) {
			deal = crmDealDao.findById(requestDto.getDealId())
				.orElseThrow(() -> new EntityNotFoundException(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND));
		}

		// Create task
		CrmTask task = new CrmTask();
		task.setName(requestDto.getName().trim());
		task.setType(taskType);
		task.setPriority(priority);
		task.setIsCompleted(false);
		task.setDueAt(requestDto.getDueAt());
		task.setNotes(normalizeNullableText(requestDto.getNotes()));
		task.setOwner(owner);
		task.setContact(contact);
		task.setCompany(contact.getCompany());
		task.setDeal(deal);
		task.setIsDeleted(false);

		crmTaskDao.save(task);

		log.info("createContactTask: execution ended, task created with id: {}", task.getId());
		return new ResponseEntityDto(messageUtil.getMessage(CrmMessageConstant.CRM_SUCCESS_TASK_CREATED), false);
	}

	@Override
	@Transactional
	public ResponseEntityDto createContactDeal(Long contactId, CrmDealCreateRequestDto requestDto) {
		log.info("createContactDeal: execution started for contactId: {}", contactId);

		User currentUser = userService.getCurrentUser();

		// Verify contact exists
		CrmContact contact = crmContactDao.findByIdAndIsDeletedFalse(contactId)
			.orElseThrow(() -> new EntityNotFoundException(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND));

		// Resolve deal stage
		CrmDealStage stage = crmDealStageDao.findByIdAndIsDeletedFalse(requestDto.getStageId())
			.orElseThrow(() -> new EntityNotFoundException(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_NOT_FOUND));

		// Resolve priority (optional)
		CrmPriority priority = null;
		if (requestDto.getPriorityId() != null) {
			priority = crmPriorityDao.findById(requestDto.getPriorityId())
				.orElseThrow(() -> new EntityNotFoundException(CrmMessageConstant.CRM_ERROR_PRIORITY_NOT_FOUND));
		}

		// Resolve owner (defaults to current user)
		Employee owner = resolveOwner(requestDto.getOwnerId(), currentUser);

		// Resolve company (optional, defaults to contact's company)
		CrmCompany company = resolveCompany(requestDto.getCompanyId());
		if (company == null) {
			company = contact.getCompany();
		}

		// Create deal
		CrmDeal deal = new CrmDeal();
		deal.setName(requestDto.getName().trim());
		deal.setStage(stage);
		deal.setPriority(priority);
		deal.setClosingAt(requestDto.getClosingAt());
		deal.setAmount(requestDto.getAmount());
		deal.setCompany(company);
		deal.setContact(contact);
		deal.setOwner(owner);
		deal.setIsDeleted(false);

		crmDealDao.save(deal);

		log.info("createContactDeal: execution ended, deal created with id: {}", deal.getId());
		return new ResponseEntityDto(messageUtil.getMessage(CrmMessageConstant.CRM_SUCCESS_DEAL_CREATED), false);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getContactTasks(Long contactId) {
		log.info("getContactTasks: execution started for contactId: {}", contactId);

		// Verify contact exists and is not deleted
		crmContactDao.findByIdAndIsDeletedFalse(contactId)
			.orElseThrow(() -> new EntityNotFoundException(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND));

		List<CrmTaskResponseDto> tasks = crmTaskDao.findByContactIdAndIsDeletedFalse(contactId)
			.stream()
			.map(crmMapper::crmTaskToCrmTaskResponseDto)
			.toList();

		log.info("getContactTasks: execution ended with {} tasks", tasks.size());
		return new ResponseEntityDto(false, tasks);
	}

	@Override
	@Transactional
	public ResponseEntityDto deleteContact(Long id) {
		log.info("deleteContact: execution started for id: {}", id);

		CrmContact contact = crmContactDao.findByIdAndIsDeletedFalse(id)
			.orElseThrow(() -> new EntityNotFoundException(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND));

		// Cascade soft delete to all associated deals and tasks
		int dealsDeleted = crmDealDao.softDeleteByContactId(id);
		int tasksDeleted = crmTaskDao.softDeleteByContactId(id);

		log.info("deleteContact: soft deleting {} deals and {} tasks for contact {}", dealsDeleted, tasksDeleted, id);

		// Soft delete the contact itself
		contact.setIsDeleted(true);
		crmContactDao.save(contact);

		log.info("deleteContact: execution ended");
		return new ResponseEntityDto(messageUtil.getMessage(CrmMessageConstant.CRM_SUCCESS_CONTACT_DELETED), false);
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
	@Transactional(readOnly = true)
	public ResponseEntityDto getContactsLookup(CrmContactLookupFilterDto filterDto) {
		log.info("getContactsLookup: execution started");

		Pageable pageable = PageRequest.of(filterDto.getPage(), filterDto.getSize());
		Page<CrmContact> contactPage = crmContactRepository.findContactsForLookup(filterDto.getSearchKeyword(),
				pageable);

		List<CrmContactLookupResponseDto> contactDtos = contactPage.getContent()
			.stream()
			.map(crmMapper::crmContactToCrmContactLookupResponseDto)
			.toList();

		PageDto pageDto = new PageDto();
		pageDto.setItems(contactDtos);
		pageDto.setCurrentPage(contactPage.getNumber());
		pageDto.setTotalItems(contactPage.getTotalElements());
		pageDto.setTotalPages(contactPage.getTotalPages());

		log.info("getContactsLookup: execution ended");
		return new ResponseEntityDto(false, pageDto);
	}

	private void enforceEditPermission(CrmContact contact, User currentUser) {
		Employee currentEmployee = currentUser.getEmployee();
		if (currentEmployee == null) {
			throw new ValidationException(CrmMessageConstant.CRM_ERROR_CONTACT_EDIT_DENIED);
		}

		EmployeeRole currentEmployeeRole = currentEmployee.getEmployeeRole();
		boolean isSuperAdmin = currentEmployeeRole != null
				&& Boolean.TRUE.equals(currentEmployeeRole.getIsSuperAdmin());
		Role currentCrmRole = currentEmployeeRole != null ? currentEmployeeRole.getCrmRole() : null;

		// Super admins, CRM admins and sales managers can edit any contact
		if (isSuperAdmin || currentCrmRole == Role.CRM_ADMIN || currentCrmRole == Role.CRM_SALES_MANAGER) {
			return;
		}

		// Sales reps can only edit contacts they own
		if (currentCrmRole == Role.CRM_SALES_REPRESENTATIVE) {
			if (contact.getOwner() != null
					&& contact.getOwner().getEmployeeId().equals(currentEmployee.getEmployeeId())) {
				return;
			}
		}

		throw new ValidationException(CrmMessageConstant.CRM_ERROR_CONTACT_EDIT_DENIED);
	}

	private Map<Long, CrmDealSummary> buildClosedDealSummaryMap(List<Long> contactIds) {
		return crmDealRepository.findClosedDealSummaryByContactIds(contactIds)
			.stream()
			.collect(Collectors.toMap(CrmDealSummary::getContactId, Function.identity()));
	}

	private Map<Long, CrmActiveDealSummary> buildActiveDealSummaryMap(List<Long> contactIds) {
		return crmDealRepository.findActiveDealSummaryByContactIds(contactIds)
			.stream()
			.collect(Collectors.toMap(CrmActiveDealSummary::getContactId, Function.identity()));
	}

	private Map<Long, CrmTaskSummary> buildTaskSummaryMap(List<Long> contactIds) {
		return crmTaskRepository.findOpenTaskSummaryByContactIds(contactIds)
			.stream()
			.collect(Collectors.toMap(CrmTaskSummary::getContactId, Function.identity()));
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
