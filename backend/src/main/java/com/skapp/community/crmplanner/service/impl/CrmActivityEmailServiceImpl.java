package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.StringUtils;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.CrmActivityEmail;
import com.skapp.community.crmplanner.model.CrmActivityEmailContact;
import com.skapp.community.crmplanner.model.CrmActivityEmailContactId;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.payload.request.CrmActivityEmailCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityEmailEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityEmailFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityEmailResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmContactLookupResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmDealResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityEmailContactDao;
import com.skapp.community.crmplanner.repository.CrmActivityEmailDao;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.service.CrmActivityEmailService;
import com.skapp.community.crmplanner.type.CrmActivityEmailContactRole;
import com.skapp.community.crmplanner.type.CrmActivityEmailFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityEmailSort;
import com.skapp.community.crmplanner.util.CrmUtil;
import com.skapp.community.crmplanner.util.CrmValidations;
import com.skapp.community.peopleplanner.util.Validations;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmActivityEmailServiceImpl implements CrmActivityEmailService {

	private final CrmActivityEmailDao crmActivityEmailDao;

	private final CrmActivityEmailContactDao crmActivityEmailContactDao;

	private final UserService userService;

	private final TimeZoneService timeZoneService;

	private final CrmMapper crmMapper;

	private final CrmContactDao crmContactDao;

	private final CrmDealDao crmDealDao;

	private final CrmCompanyDao crmCompanyDao;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getEmails(CrmActivityEmailFilterDto filterDto) {
		log.info("getEmails: execution started");

		User currentUser = userService.getCurrentUser();
		CrmActivityEmailSort sortKey = filterDto.getSortKey() != null ? filterDto.getSortKey()
				: CrmActivityEmailSort.LOGGED_AT;

		CrmActivityEmailFilterParams params = new CrmActivityEmailFilterParams();
		params.setSortKey(sortKey);
		boolean isRepresentative = CrmUtil.isCrmSalesRepresentative(currentUser);
		params.setCurrentEmployeeId(currentUser.getEmployee().getEmployeeId());
		params.setIsRestrictedToOwner(isRepresentative);

		params.setOwnerId(filterDto.getOwnerId());
		if (!StringUtils.isNullOrBlank(filterDto.getSearchKeyword())) {
			params.setSearchPattern(
					"%" + StringUtils.escapeLikePattern(filterDto.getSearchKeyword().toLowerCase()) + "%");
		}
		Sort.Direction defaultSortOrder = sortKey == CrmActivityEmailSort.OWNER ? Sort.Direction.ASC
				: Sort.Direction.DESC;
		params.setSortOrder(filterDto.getSortOrder() != null ? filterDto.getSortOrder() : defaultSortOrder);

		ZoneId zone = timeZoneService.requestTimezone();
		if (filterDto.getStartDate() != null) {
			params.setRangeStart(filterDto.getStartDate().atStartOfDay(zone).toInstant());
		}
		if (filterDto.getEndDate() != null) {
			params.setRangeEnd(filterDto.getEndDate().plusDays(1).atStartOfDay(zone).toInstant());
		}

		List<CrmActivityEmailResponseDto> emails = crmActivityEmailDao.findEmails(params);

		log.info("getEmails: execution ended");
		return new ResponseEntityDto(false, emails);
	}

	@Override
	@Transactional
	public ResponseEntityDto createEmail(CrmActivityEmailCreateRequestDto requestDto) {
		log.info("createEmail: execution started");
		validateActivityCreationLimit();

		List<Long> toIds = requestDto.getToContactIds();
		List<Long> ccIds = requestDto.getCcContactIds() != null ? requestDto.getCcContactIds() : List.of();
		List<Long> bccIds = requestDto.getBccContactIds() != null ? requestDto.getBccContactIds() : List.of();

		CrmValidations.validateEmailSubject(requestDto.getSubject());
		CrmValidations.validateEmailLoggedAt(requestDto.getLoggedAt());
		CrmValidations.validateEmailRecipientIds(toIds, ccIds, bccIds);
		Validations.validateEmail(requestDto.getFromAddress());

		User currentUser = userService.getCurrentUser();

		CrmActivityEmail email = new CrmActivityEmail();
		email.setSubject(requestDto.getSubject());
		email.setFromAddress(requestDto.getFromAddress());
		email.setLoggedAt(requestDto.getLoggedAt());
		email.setDescription(requestDto.getDescription());
		email.setOwner(currentUser.getEmployee());

		List<Long> contactIds = Stream.of(toIds, ccIds, bccIds).flatMap(List::stream).sorted().toList();
		Map<Long, CrmContact> contactsById = findRecipientContactsById(contactIds);

		if (requestDto.getDealId() != null) {
			CrmDeal deal = crmDealDao.findByIdAndIsDeletedFalse(requestDto.getDealId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND));
			if (CrmValidations.isOwnerRestrictedForRepresentative(currentUser, deal.getOwner().getEmployeeId())) {
				throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_VIEW_DENIED);
			}
			CrmValidations.validateEmailDealMatchesRecipientCompanies(deal, contactsById.values().stream().toList());
			email.setDeal(deal);
		}

		if (requestDto.getCompanyId() != null) {
			CrmCompany company = crmCompanyDao.findByIdAndIsDeletedFalse(requestDto.getCompanyId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_COMPANY_NOT_FOUND));
			email.setCompany(company);
		}

		CrmActivityEmail savedEmail = crmActivityEmailDao.save(email);

		List<CrmActivityEmailContact> recipients = new ArrayList<>();
		recipients.addAll(buildRecipients(savedEmail, toIds, CrmActivityEmailContactRole.TO, contactsById, Map.of()));
		recipients.addAll(buildRecipients(savedEmail, ccIds, CrmActivityEmailContactRole.CC, contactsById, Map.of()));
		recipients.addAll(buildRecipients(savedEmail, bccIds, CrmActivityEmailContactRole.BCC, contactsById, Map.of()));
		crmActivityEmailContactDao.saveAll(recipients);

		CrmActivityEmailResponseDto response = crmMapper.crmActivityEmailToCrmActivityEmailResponseDto(savedEmail);
		response.setContactIds(contactIds);

		log.info("createEmail: execution ended");
		return new ResponseEntityDto(false, response);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getEmailById(Long id) {
		log.info("getEmailById: execution started");

		CrmActivityEmail email = crmActivityEmailDao.findEmailById(id);
		if (email == null) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_ACTIVITY_EMAIL_NOT_FOUND);
		}

		User currentUser = userService.getCurrentUser();
		if (CrmValidations.isOwnerRestrictedForRepresentative(currentUser, email.getOwner().getEmployeeId())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_ACTIVITY_EMAIL_VIEW_DENIED);
		}

		List<CrmActivityEmailContact> existingRecipients = crmActivityEmailContactDao.findByEmailId(email.getId());
		CrmActivityEmailResponseDto response = crmMapper.crmActivityEmailToCrmActivityEmailResponseDto(email);
		response.setTo(getRecipientLookups(existingRecipients, CrmActivityEmailContactRole.TO));
		response.setCc(getRecipientLookups(existingRecipients, CrmActivityEmailContactRole.CC));
		response.setBcc(getRecipientLookups(existingRecipients, CrmActivityEmailContactRole.BCC));
		if (email.getDeal() != null && Boolean.TRUE.equals(email.getDeal().getIsDeleted())) {
			response.setDealId(null);
			response.setDeal(null);
		}
		else if (email.getDeal() != null) {
			response.setDeal(CrmUtil.toDealResponseDto(crmMapper, email.getDeal()));
		}
		if (email.getCompany() != null && Boolean.TRUE.equals(email.getCompany().getIsDeleted())) {
			response.setCompanyId(null);
			response.setCompany(null);
		}

		CrmDealResponseDto deal = response.getDeal();
		if (deal != null && CrmValidations.isOwnerRestrictedForRepresentative(currentUser, deal.getOwnerId())) {
			CrmDealResponseDto restrictedDeal = new CrmDealResponseDto();
			restrictedDeal.setId(deal.getId());
			restrictedDeal.setOwnerId(deal.getOwnerId());
			response.setDeal(restrictedDeal);
		}

		log.info("getEmailById: execution ended");
		return new ResponseEntityDto(false, response);
	}

	@Override
	@Transactional
	public ResponseEntityDto editEmail(Long id, CrmActivityEmailEditRequestDto requestDto) {
		log.info("editEmail: execution started");

		CrmActivityEmail email = crmActivityEmailDao.findEmailById(id);
		if (email == null) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_ACTIVITY_EMAIL_NOT_FOUND);
		}

		User currentUser = userService.getCurrentUser();
		if (CrmValidations.isOwnerRestrictedForRepresentative(currentUser, email.getOwner().getEmployeeId())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_ACTIVITY_EMAIL_EDIT_DENIED);
		}

		if (requestDto.getSubject() != null) {
			CrmValidations.validateEmailSubject(requestDto.getSubject());
			email.setSubject(requestDto.getSubject());
		}

		if (requestDto.getFromAddress() != null) {
			Validations.validateEmail(requestDto.getFromAddress());
			email.setFromAddress(requestDto.getFromAddress());
		}

		if (requestDto.getLoggedAt() != null) {
			email.setLoggedAt(requestDto.getLoggedAt());
		}

		if (requestDto.getDescription() != null) {
			email.setDescription(requestDto.getDescription());
		}

		if (Boolean.TRUE.equals(requestDto.getIsDealRemoved())) {
			email.setDeal(null);
		}
		else if (requestDto.getDealId() != null) {
			CrmDeal deal = crmDealDao.findByIdAndIsDeletedFalse(requestDto.getDealId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND));
			if (CrmValidations.isOwnerRestrictedForRepresentative(currentUser, deal.getOwner().getEmployeeId())) {
				throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_VIEW_DENIED);
			}
			email.setDeal(deal);
		}

		if (Boolean.TRUE.equals(requestDto.getIsCompanyRemoved())) {
			email.setCompany(null);
		}
		else if (requestDto.getCompanyId() != null) {
			CrmCompany company = crmCompanyDao.findByIdAndIsDeletedFalse(requestDto.getCompanyId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_COMPANY_NOT_FOUND));
			email.setCompany(company);
		}

		List<CrmActivityEmailContact> existingRecipients = crmActivityEmailContactDao.findByEmailId(email.getId());
		List<Long> sentIds = Stream
			.of(requestDto.getToContactIds(), requestDto.getCcContactIds(), requestDto.getBccContactIds())
			.filter(ids -> ids != null)
			.flatMap(List::stream)
			.toList();
		List<Long> toIds = requestDto.getToContactIds() != null ? requestDto.getToContactIds()
				: getRecipientIds(existingRecipients, CrmActivityEmailContactRole.TO, sentIds);
		List<Long> ccIds = requestDto.getCcContactIds() != null ? requestDto.getCcContactIds()
				: getRecipientIds(existingRecipients, CrmActivityEmailContactRole.CC, sentIds);
		List<Long> bccIds = requestDto.getBccContactIds() != null ? requestDto.getBccContactIds()
				: getRecipientIds(existingRecipients, CrmActivityEmailContactRole.BCC, sentIds);
		List<Long> contactIds = Stream.of(toIds, ccIds, bccIds).flatMap(List::stream).toList();
		List<CrmContact> recipientContacts = new ArrayList<>(existingRecipients.stream()
			.map(CrmActivityEmailContact::getContact)
			.filter(contact -> contactIds.contains(contact.getId()) && !sentIds.contains(contact.getId())
					&& !Boolean.TRUE.equals(contact.getIsDeleted()))
			.toList());

		if (requestDto.getToContactIds() != null || requestDto.getCcContactIds() != null
				|| requestDto.getBccContactIds() != null) {
			CrmValidations.validateEmailRecipientIds(toIds, ccIds, bccIds);

			Map<Long, CrmContact> contactsById = findRecipientContactsById(sentIds);
			recipientContacts.addAll(contactsById.values());
			Map<Long, CrmActivityEmailContact> existingById = existingRecipients.stream()
				.collect(Collectors.toMap(link -> link.getContact().getId(), Function.identity()));

			List<CrmActivityEmailContact> recipients = new ArrayList<>();
			if (requestDto.getToContactIds() != null) {
				recipients
					.addAll(buildRecipients(email, toIds, CrmActivityEmailContactRole.TO, contactsById, existingById));
			}
			if (requestDto.getCcContactIds() != null) {
				recipients
					.addAll(buildRecipients(email, ccIds, CrmActivityEmailContactRole.CC, contactsById, existingById));
			}
			if (requestDto.getBccContactIds() != null) {
				recipients.addAll(
						buildRecipients(email, bccIds, CrmActivityEmailContactRole.BCC, contactsById, existingById));
			}

			List<CrmActivityEmailContact> removedRecipients = existingRecipients.stream()
				.filter(link -> !contactIds.contains(link.getContact().getId()))
				.toList();
			crmActivityEmailContactDao.deleteAll(removedRecipients);
			crmActivityEmailContactDao.saveAll(recipients);
		}

		if (email.getDeal() != null && (requestDto.getDealId() != null || !sentIds.isEmpty())) {
			CrmValidations.validateEmailDealMatchesRecipientCompanies(email.getDeal(), recipientContacts);
		}

		CrmActivityEmail updatedEmail = crmActivityEmailDao.save(email);

		CrmActivityEmailResponseDto response = crmMapper.crmActivityEmailToCrmActivityEmailResponseDto(updatedEmail);
		response.setContactIds(contactIds.stream().sorted().toList());

		log.info("editEmail: execution ended");
		return new ResponseEntityDto(false, response);
	}

	private Map<Long, CrmContact> findRecipientContactsById(List<Long> contactIds) {
		List<CrmContact> contacts = crmContactDao.findByIdInAndIsDeletedFalseOrderByIdAsc(contactIds);
		if (contacts.size() != contactIds.size()) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND);
		}
		return contacts.stream().collect(Collectors.toMap(CrmContact::getId, Function.identity()));
	}

	private List<CrmActivityEmailContact> buildRecipients(CrmActivityEmail email, List<Long> contactIds,
			CrmActivityEmailContactRole role, Map<Long, CrmContact> contactsById,
			Map<Long, CrmActivityEmailContact> existingById) {
		return contactIds.stream().map(contactId -> {
			CrmActivityEmailContact recipient = existingById.get(contactId);
			if (recipient == null) {
				recipient = new CrmActivityEmailContact();
				recipient.setId(new CrmActivityEmailContactId(email.getId(), contactId));
				recipient.setEmail(email);
				recipient.setContact(contactsById.get(contactId));
			}
			recipient.setRole(role);
			return recipient;
		}).toList();
	}

	private List<Long> getRecipientIds(List<CrmActivityEmailContact> existingRecipients,
			CrmActivityEmailContactRole role, List<Long> sentIds) {
		return existingRecipients.stream()
			.filter(link -> link.getRole() == role)
			.map(link -> link.getContact().getId())
			.filter(contactId -> !sentIds.contains(contactId))
			.toList();
	}

	private List<CrmContactLookupResponseDto> getRecipientLookups(List<CrmActivityEmailContact> existingRecipients,
			CrmActivityEmailContactRole role) {
		return existingRecipients.stream()
			.filter(link -> link.getRole() == role)
			.map(CrmActivityEmailContact::getContact)
			.filter(contact -> !Boolean.TRUE.equals(contact.getIsDeleted()))
			.map(crmMapper::crmContactToCrmContactLookupResponseDto)
			.toList();
	}

	protected void validateActivityCreationLimit() {
	}

}
