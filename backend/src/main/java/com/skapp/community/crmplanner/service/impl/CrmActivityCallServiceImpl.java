package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.StringUtils;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.CrmActivityCall;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.payload.request.CrmActivityCallCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityCallEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityCallFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityCallDetailResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityCallResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmDealResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityCallDao;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.service.CrmActivityCallService;
import com.skapp.community.crmplanner.service.CrmOwnerResolverService;
import com.skapp.community.crmplanner.type.CrmActivityCallFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityCallSort;
import com.skapp.community.crmplanner.util.CrmUtil;
import com.skapp.community.crmplanner.util.CrmValidations;
import com.skapp.community.peopleplanner.model.Employee;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmActivityCallServiceImpl implements CrmActivityCallService {

	private final CrmActivityCallDao crmActivityCallDao;

	private final UserService userService;

	private final TimeZoneService timeZoneService;

	private final CrmMapper crmMapper;

	private final CrmContactDao crmContactDao;

	private final CrmDealDao crmDealDao;

	private final CrmCompanyDao crmCompanyDao;

	private final CrmOwnerResolverService crmOwnerResolver;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getCalls(CrmActivityCallFilterDto filterDto) {
		log.info("getCalls: execution started");

		User currentUser = userService.getCurrentUser();
		CrmActivityCallSort sortKey = filterDto.getSortKey() != null ? filterDto.getSortKey()
				: CrmActivityCallSort.LOGGED_AT;

		CrmActivityCallFilterParams params = new CrmActivityCallFilterParams();
		params.setSortKey(sortKey);
		boolean isRepresentative = CrmUtil.isCrmSalesRepresentative(currentUser);
		params.setCurrentEmployeeId(currentUser.getEmployee().getEmployeeId());
		params.setIsRestrictedToOwner(isRepresentative);

		boolean hasDateRange = filterDto.getStartDate() != null || filterDto.getEndDate() != null;
		if (isRepresentative && (filterDto.getOwnerId() != null || hasDateRange)) {
			throw new AccessDeniedException(CommonMessageConstant.COMMON_ERROR_ACCESS_DENIED.name());
		}

		CrmValidations.validateActivityDateRange(filterDto.getStartDate(), filterDto.getEndDate());

		params.setOwnerId(filterDto.getOwnerId());
		if (!StringUtils.isNullOrBlank(filterDto.getSearchKeyword())) {
			params.setSearchPattern(
					"%" + StringUtils.escapeLikePattern(filterDto.getSearchKeyword().toLowerCase()) + "%");
		}
		Sort.Direction defaultSortOrder = sortKey == CrmActivityCallSort.OWNER ? Sort.Direction.ASC
				: Sort.Direction.DESC;
		params.setSortOrder(filterDto.getSortOrder() != null ? filterDto.getSortOrder() : defaultSortOrder);

		ZoneId zone = timeZoneService.requestTimezone();
		if (filterDto.getStartDate() != null) {
			params.setRangeStart(filterDto.getStartDate().atStartOfDay(zone).toInstant());
		}
		if (filterDto.getEndDate() != null) {
			params.setRangeEnd(filterDto.getEndDate().plusDays(1).atStartOfDay(zone).toInstant());
		}

		List<CrmActivityCallResponseDto> calls = crmActivityCallDao.findCalls(params);

		log.info("getCalls: execution ended");
		return new ResponseEntityDto(false, calls);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getCallById(Long id) {
		log.info("getCallById: execution started");

		CrmActivityCall call = crmActivityCallDao.findCallById(id);
		if (call == null) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_ACTIVITY_CALL_NOT_FOUND);
		}

		User currentUser = userService.getCurrentUser();
		if (CrmValidations.isOwnerRestrictedForRepresentative(currentUser, call.getOwner().getEmployeeId())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_ACTIVITY_CALL_VIEW_DENIED);
		}

		CrmActivityCallDetailResponseDto response = crmMapper.crmActivityCallToCrmActivityCallDetailResponseDto(call);
		if (call.getContact() != null && Boolean.TRUE.equals(call.getContact().getIsDeleted())) {
			response.setContact(null);
		}
		if (call.getDeal() != null && Boolean.TRUE.equals(call.getDeal().getIsDeleted())) {
			response.setDeal(null);
		}
		else if (call.getDeal() != null) {
			response.setDeal(CrmUtil.toDealResponseDto(crmMapper, call.getDeal()));
		}
		if (call.getCompany() != null && Boolean.TRUE.equals(call.getCompany().getIsDeleted())) {
			response.setCompany(null);
		}

		CrmDealResponseDto deal = response.getDeal();
		if (deal != null && CrmValidations.isOwnerRestrictedForRepresentative(currentUser, deal.getOwnerId())) {
			CrmDealResponseDto restrictedDeal = new CrmDealResponseDto();
			restrictedDeal.setId(deal.getId());
			restrictedDeal.setOwnerId(deal.getOwnerId());
			response.setDeal(restrictedDeal);
		}

		log.info("getCallById: execution ended");
		return new ResponseEntityDto(false, response);
	}

	@Override
	@Transactional
	public ResponseEntityDto createCall(CrmActivityCallCreateRequestDto requestDto) {
		log.info("createCall: execution started");

		CrmValidations.validateCallSubject(requestDto.getSubject());
		CrmValidations.validateCallContactId(requestDto.getContactId());
		CrmValidations.validateCallDurationMinutes(requestDto.getDurationMinutes());

		User currentUser = userService.getCurrentUser();
		Employee owner = requestDto.getOwnerId() != null
				? crmOwnerResolver.resolveOwner(requestDto.getOwnerId(), currentUser) : currentUser.getEmployee();

		CrmContact contact = crmContactDao.findByIdAndIsDeletedFalse(requestDto.getContactId())
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND));

		CrmActivityCall call = new CrmActivityCall();
		call.setSubject(requestDto.getSubject());
		call.setLoggedAt(requestDto.getLoggedAt() != null ? requestDto.getLoggedAt() : Instant.now());
		call.setDurationMinutes(requestDto.getDurationMinutes());
		call.setComments(requestDto.getComments());
		call.setOwner(owner);
		call.setContact(contact);

		if (requestDto.getDealId() != null) {
			CrmDeal deal = crmDealDao.findByIdAndIsDeletedFalse(requestDto.getDealId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND));
			if (CrmValidations.isOwnerRestrictedForRepresentative(currentUser, deal.getOwner().getEmployeeId())) {
				throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_VIEW_DENIED);
			}
			CrmValidations.validateCallDealMatchesContactCompany(deal, contact);
			call.setDeal(deal);
		}

		if (requestDto.getCompanyId() != null) {
			CrmCompany company = crmCompanyDao.findByIdAndIsDeletedFalse(requestDto.getCompanyId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_COMPANY_NOT_FOUND));
			call.setCompany(company);
		}

		CrmActivityCall savedCall = crmActivityCallDao.save(call);

		log.info("createCall: execution ended");
		return new ResponseEntityDto(false, crmMapper.crmActivityCallToCrmActivityCallResponseDto(savedCall));
	}

	@Override
	@Transactional
	public ResponseEntityDto editCall(Long id, CrmActivityCallEditRequestDto requestDto) {
		log.info("editCall: execution started");

		CrmActivityCall call = crmActivityCallDao.findCallById(id);
		if (call == null) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_ACTIVITY_CALL_NOT_FOUND);
		}

		User currentUser = userService.getCurrentUser();
		if (CrmValidations.isOwnerRestrictedForRepresentative(currentUser, call.getOwner().getEmployeeId())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_ACTIVITY_CALL_EDIT_DENIED);
		}

		if (requestDto.getSubject() != null) {
			CrmValidations.validateCallSubject(requestDto.getSubject());
			call.setSubject(requestDto.getSubject());
		}

		if (requestDto.getLoggedAt() != null) {
			call.setLoggedAt(requestDto.getLoggedAt());
		}

		if (requestDto.getDurationMinutes() != null) {
			CrmValidations.validateCallDurationMinutes(requestDto.getDurationMinutes());
			call.setDurationMinutes(requestDto.getDurationMinutes());
		}

		if (requestDto.getComments() != null) {
			call.setComments(requestDto.getComments());
		}

		if (requestDto.getOwnerId() != null) {
			Employee owner = crmOwnerResolver.resolveOwner(requestDto.getOwnerId(), currentUser);
			call.setOwner(owner);
		}

		if (requestDto.getContactId() != null) {
			CrmContact contact = crmContactDao.findByIdAndIsDeletedFalse(requestDto.getContactId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND));
			call.setContact(contact);
		}

		if (requestDto.getDealId() != null) {
			CrmDeal deal = crmDealDao.findByIdAndIsDeletedFalse(requestDto.getDealId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND));
			if (CrmValidations.isOwnerRestrictedForRepresentative(currentUser, deal.getOwner().getEmployeeId())) {
				throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_VIEW_DENIED);
			}
			call.setDeal(deal);
		}

		if (requestDto.getCompanyId() != null) {
			CrmCompany company = crmCompanyDao.findByIdAndIsDeletedFalse(requestDto.getCompanyId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_COMPANY_NOT_FOUND));
			call.setCompany(company);
		}

		if (requestDto.getContactId() != null || requestDto.getDealId() != null) {
			CrmValidations.validateCallDealMatchesContactCompany(call.getDeal(), call.getContact());
		}

		CrmActivityCall updatedCall = crmActivityCallDao.save(call);

		log.info("editCall: execution ended");
		return new ResponseEntityDto(false, crmMapper.crmActivityCallToCrmActivityCallResponseDto(updatedCall));
	}

}
