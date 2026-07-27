package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.payload.request.CrmContactCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmContactEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmContactFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmContactMetricRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmContactOwnerFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmContactDetailResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmContactListItemDto;
import com.skapp.community.crmplanner.payload.response.CrmContactLookupResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmContactOwnerResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmDealDetailResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmExistsResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmTaskDetailResponseDto;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmContactOwnerRepository;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.repository.CrmTaskDao;
import com.skapp.community.crmplanner.service.CrmContactService;
import com.skapp.community.crmplanner.type.CrmContactDealMetrics;
import com.skapp.community.crmplanner.type.CrmContactTaskMetrics;
import com.skapp.community.crmplanner.service.CrmOwnerResolverService;
import com.skapp.community.crmplanner.type.CrmDealSummary;
import com.skapp.community.crmplanner.type.CrmTaskSummary;
import com.skapp.community.crmplanner.util.CrmUtil;
import com.skapp.community.crmplanner.util.CrmValidations;
import com.skapp.community.peopleplanner.model.Employee;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmContactServiceImpl implements CrmContactService {

	private final CrmContactDao crmContactDao;

	private final CrmCompanyDao crmCompanyDao;

	private final CrmDealDao crmDealDao;

	private final CrmTaskDao crmTaskDao;

	private final CrmContactOwnerRepository crmContactOwnerRepository;

	private final UserService userService;

	private final MessageUtil messageUtil;

	private final CrmMapper crmMapper;

	private final CrmOwnerResolverService crmOwnerResolver;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto checkContactEmailExists(String email) {
		log.info("checkContactEmailExists: execution started");

		CrmValidations.validateContactEmail(email);
		boolean exists = crmContactDao.existsByEmailIgnoreCaseAndIsDeletedFalse(email);

		CrmExistsResponseDto responseDto = new CrmExistsResponseDto();
		responseDto.setIsExists(exists);

		log.info("checkContactEmailExists: execution ended");
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	@Transactional
	public ResponseEntityDto createContact(CrmContactCreateRequestDto requestDto) {
		log.info("createContact: execution started");

		validateContactPayload(requestDto.getFirstName(), requestDto.getLastName(), requestDto.getEmail(),
				requestDto.getContactNumber(), requestDto.getOwnerId());
		validateContactCreationLimit();

		User currentUser = userService.getCurrentUser();

		String lowercaseEmail = requestDto.getEmail().toLowerCase();
		if (crmContactDao.existsByEmailIgnoreCaseAndIsDeletedFalse(lowercaseEmail)) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_CONTACT_EMAIL_ALREADY_EXISTS);
		}

		CrmCompany company = requestDto.getCompanyId() != null
				? crmCompanyDao.findByIdAndIsDeletedFalse(requestDto.getCompanyId())
					.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_COMPANY_NOT_FOUND))
				: null;
		Employee owner = crmOwnerResolver.resolveOwner(requestDto.getOwnerId(), currentUser);

		CrmContact contact = new CrmContact();
		contact.setFirstName(requestDto.getFirstName());
		contact.setLastName(requestDto.getLastName());
		contact.setEmail(lowercaseEmail);
		contact.setContactNumber(requestDto.getContactNumber());
		contact.setCompany(company);
		contact.setOwner(owner);

		CrmContact savedContact = crmContactDao.save(contact);

		log.info("createContact: execution ended");
		return new ResponseEntityDto(false, crmMapper.crmContactToCrmContactResponseDto(savedContact));
	}

	protected void validateContactCreationLimit() {
		// This method is a placeholder for enterprise contact creation limit validation
	}

	@Override
	@Transactional
	public ResponseEntityDto editContact(Long id, CrmContactEditRequestDto requestDto) {
		log.info("editContact: execution started");

		User currentUser = userService.getCurrentUser();

		CrmContact contact = crmContactDao.findByIdAndIsDeletedFalse(id)
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND));

		if (CrmValidations.isOwnerRestrictedForRepresentative(currentUser, contact.getOwner().getEmployeeId())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_CONTACT_EDIT_DENIED);
		}

		if (requestDto.getFirstName() != null) {
			CrmValidations.validateContactFirstName(requestDto.getFirstName());
			contact.setFirstName(requestDto.getFirstName());
		}

		if (requestDto.getLastName() != null) {
			String lastName = requestDto.getLastName();
			CrmValidations.validateContactLastName(lastName);
			contact.setLastName(StringUtils.hasText(lastName) ? lastName : null);
		}

		if (requestDto.getEmail() != null) {
			CrmValidations.validateContactEmail(requestDto.getEmail());
			String lowercaseEmail = requestDto.getEmail().toLowerCase();
			if (!lowercaseEmail.equals(contact.getEmail())
					&& crmContactDao.existsByEmailIgnoreCaseAndIsDeletedFalseAndIdNot(lowercaseEmail, id)) {
				throw new ModuleException(CrmMessageConstant.CRM_ERROR_CONTACT_EMAIL_ALREADY_EXISTS);
			}
			contact.setEmail(lowercaseEmail);
		}

		if (requestDto.getContactNumber() != null) {
			CrmValidations.validateContactNumber(requestDto.getContactNumber());
			contact.setContactNumber(requestDto.getContactNumber());
		}

		if (requestDto.getCompanyId().isPresent()) {
			Long companyId = requestDto.getCompanyId().get();

			if (companyId != null) {
				CrmCompany company = crmCompanyDao.findByIdAndIsDeletedFalse(companyId)
					.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_COMPANY_NOT_FOUND));
				updateContactCompany(contact, company);
			}
			else {
				updateContactCompany(contact, null);
			}
		}

		if (requestDto.getOwnerId() != null) {
			CrmValidations.validateOwnerId(requestDto.getOwnerId());
			Employee owner = crmOwnerResolver.resolveOwner(requestDto.getOwnerId(), currentUser);
			contact.setOwner(owner);
		}

		CrmContact savedContact = crmContactDao.save(contact);

		log.info("editContact: execution ended");
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

		Set<CrmTask> tasks = new HashSet<>();
		tasks.addAll(crmTaskDao.findByContact_IdAndIsDeletedFalse(id));
		tasks.addAll(crmTaskDao.findByDeal_Contact_IdAndIsDeletedFalse(id));
		tasks.forEach(task -> task.setIsDeleted(true));
		crmTaskDao.saveAll(tasks);

		List<CrmDeal> deals = crmDealDao.findByContact_IdAndIsDeletedFalse(id);
		deals.forEach(deal -> deal.setIsDeleted(true));
		crmDealDao.saveAll(deals);

		contact.setIsDeleted(true);
		crmContactDao.save(contact);

		log.info("deleteContact: execution ended");
		return new ResponseEntityDto(messageUtil.getMessage(CrmMessageConstant.CRM_SUCCESS_CONTACT_DELETED), false);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getContactMetrics(CrmContactMetricRequestDto filterDto) {
		log.info("getContactMetrics: execution started");

		Pageable pageable = PageRequest.of(filterDto.getPage(), filterDto.getSize());
		Page<CrmContact> contactPage = crmContactDao.findContacts(filterDto, pageable);

		List<Long> contactIds = contactPage.getContent().stream().map(CrmContact::getId).toList();

		if (contactIds.isEmpty()) {
			PageDto pageDto = new PageDto();
			pageDto.setItems(List.of());
			pageDto.setCurrentPage(contactPage.getNumber());
			pageDto.setTotalItems(contactPage.getTotalElements());
			pageDto.setTotalPages(contactPage.getTotalPages());
			log.info("getContactMetrics: execution ended");
			return new ResponseEntityDto(false, pageDto);
		}

		Map<Long, CrmDealSummary> dealSummaryMap = crmDealDao.findClosedDealSummaryByContactIds(contactIds)
			.stream()
			.collect(Collectors.toMap(CrmDealSummary::getContactId, Function.identity()));

		Map<Long, CrmTaskSummary> taskSummaryMap = crmTaskDao.findOpenTaskSummaryByContactIds(contactIds)
			.stream()
			.collect(Collectors.toMap(CrmTaskSummary::getContactId, Function.identity()));

		List<CrmContactListItemDto> contactDtos = contactPage.getContent()
			.stream()
			.map(c -> enrichWithMetrics(c, dealSummaryMap, taskSummaryMap))
			.toList();

		PageDto pageDto = new PageDto();
		pageDto.setItems(contactDtos);
		pageDto.setCurrentPage(contactPage.getNumber());
		pageDto.setTotalItems(contactPage.getTotalElements());
		pageDto.setTotalPages(contactPage.getTotalPages());

		log.info("getContactMetrics: execution ended");
		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getContactsLookup(CrmContactFilterDto filterDto) {
		log.info("getContactsLookup: execution started");

		Pageable pageable = PageRequest.of(filterDto.getPage(), filterDto.getSize());
		Page<CrmContact> contactPage = crmContactDao.findContactsForLookup(filterDto, pageable);

		List<CrmContactLookupResponseDto> contactDtos = contactPage.getContent()
			.stream()
			.map(this::toLookupDto)
			.toList();

		PageDto pageDto = new PageDto();
		pageDto.setItems(contactDtos);
		pageDto.setCurrentPage(contactPage.getNumber());
		pageDto.setTotalItems(contactPage.getTotalElements());
		pageDto.setTotalPages(contactPage.getTotalPages());

		log.info("getContactsLookup: execution ended");
		return new ResponseEntityDto(false, pageDto);
	}

	private CrmContactLookupResponseDto toLookupDto(CrmContact contact) {
		return CrmUtil.toContactLookupDto(crmMapper, contact);
	}

	private CrmContactListItemDto enrichWithMetrics(CrmContact contact, Map<Long, CrmDealSummary> dealSummaryMap,
			Map<Long, CrmTaskSummary> taskSummaryMap) {
		CrmContactListItemDto dto = CrmUtil.toContactListItemDto(crmMapper, contact);

		CrmDealSummary deals = dealSummaryMap.get(contact.getId());
		dto.setClosedDealValue(deals != null ? deals.getTotalClosedValue() : BigDecimal.ZERO);
		dto.setClosedDealCount(deals != null ? deals.getClosedDealCount() : 0L);

		CrmTaskSummary tasks = taskSummaryMap.get(contact.getId());
		dto.setOpenTasksCount(tasks != null ? tasks.getOpenTaskCount() : 0L);
		dto.setOverdueTasksCount(tasks != null ? tasks.getOverdueTaskCount() : 0L);

		return dto;
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getContactById(Long id) {
		log.info("getContactById: execution started");

		CrmContact contact = crmContactDao.findByIdWithAssociations(id);

		if (contact == null) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND);
		}

		List<CrmDeal> deals = crmDealDao.findByContactIdWithAssociations(id);
		List<CrmTask> tasks = crmTaskDao.findByContactIdWithAssociations(id);

		CrmContactDetailResponseDto dto = CrmUtil.toContactDetailDto(crmMapper, contact);

		CrmContactDealMetrics dealMetrics = crmDealDao.findDealMetricsByContactId(id);
		dto.setTotalRevenue(dealMetrics.getTotalRevenue().toPlainString());
		dto.setPipelineRevenue(dealMetrics.getPipelineRevenue().toPlainString());
		dto.setActiveDealsCount(dealMetrics.getActiveDealsCount());

		CrmContactTaskMetrics taskMetrics = crmTaskDao.findTaskMetricsByContactId(id);
		dto.setOpenTasksCount(taskMetrics.getOpenTasksCount());
		dto.setOverdueTasksCount(taskMetrics.getOverdueTasksCount());

		List<CrmDealDetailResponseDto> dealDtos = deals.stream()
			.map(crmMapper::crmDealToCrmDealDetailResponseDto)
			.toList();
		dto.setDeals(dealDtos);

		List<CrmTaskDetailResponseDto> taskDtos = tasks.stream()
			.map(crmMapper::crmTaskToCrmTaskDetailResponseDto)
			.toList();
		dto.setTasks(taskDtos);

		log.info("getContactById: execution ended");
		return new ResponseEntityDto(false, dto);
	}

	private void validateContactPayload(String firstName, String lastName, String email, String contactNumber,
			Long ownerId) {
		CrmValidations.validateContactFirstName(firstName);
		CrmValidations.validateContactLastName(lastName);
		CrmValidations.validateContactEmail(email);
		CrmValidations.validateContactNumber(contactNumber);
		CrmValidations.validateOwnerId(ownerId);
	}

	private void updateContactCompany(CrmContact contact, CrmCompany company) {
		Long currentCompanyId = contact.getCompany() != null ? contact.getCompany().getId() : null;
		Long newCompanyId = company != null ? company.getId() : null;
		if (Objects.equals(currentCompanyId, newCompanyId)) {
			return;
		}

		contact.setCompany(company);
		cascadeCompanyToContactAssociations(contact.getId(), company);
	}

	private void cascadeCompanyToContactAssociations(Long contactId, CrmCompany company) {
		List<CrmTask> tasks = crmTaskDao.findByContact_IdAndIsDeletedFalse(contactId);
		if (!tasks.isEmpty()) {
			tasks.forEach(task -> task.setCompany(company));
			crmTaskDao.saveAll(tasks);
		}

		List<CrmDeal> deals = crmDealDao.findByContact_IdAndIsDeletedFalse(contactId);
		if (!deals.isEmpty()) {
			deals.forEach(deal -> deal.setCompany(company));
			crmDealDao.saveAll(deals);
		}
	}

}
