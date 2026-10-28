package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.CrmActivityCall;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.payload.request.CrmActivityCallCreateRequestDto;
import com.skapp.community.crmplanner.repository.CrmActivityCallDao;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.service.CrmActivityCallCreateService;
import com.skapp.community.crmplanner.service.CrmOwnerResolverService;
import com.skapp.community.crmplanner.util.CrmValidations;
import com.skapp.community.peopleplanner.model.Employee;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmActivityCallCreateServiceImpl implements CrmActivityCallCreateService {

	private final CrmActivityCallDao crmActivityCallDao;

	private final CrmContactDao crmContactDao;

	private final CrmDealDao crmDealDao;

	private final CrmCompanyDao crmCompanyDao;

	private final UserService userService;

	private final CrmOwnerResolverService crmOwnerResolver;

	private final CrmMapper crmMapper;

	@Override
	@Transactional
	public ResponseEntityDto createCall(CrmActivityCallCreateRequestDto requestDto) {
		log.info("createCall: execution started");

		CrmValidations.validateCallSubject(requestDto.getSubject());
		CrmValidations.validateCallContactId(requestDto.getContactId());
		CrmValidations.validateCallDurationMinutes(requestDto.getDurationMinutes());
		validateCallCreationLimit();

		User currentUser = userService.getCurrentUser();
		Employee owner = resolveCallOwner(requestDto.getOwnerId(), currentUser);

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
		return new ResponseEntityDto(false, crmMapper.crmActivityCallToCrmActivityCallCreateResponseDto(savedCall));
	}

	protected void validateCallCreationLimit() {
	}

	private Employee resolveCallOwner(Long ownerId, User currentUser) {
		if (ownerId == null) {
			return currentUser.getEmployee();
		}

		return crmOwnerResolver.resolveOwner(ownerId, currentUser);
	}

}
