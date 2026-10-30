package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.StringUtils;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.CrmActivityMeeting;
import com.skapp.community.crmplanner.model.CrmActivityMeetingContact;
import com.skapp.community.crmplanner.model.CrmActivityMeetingContactId;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.payload.request.CrmActivityMeetingCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityMeetingFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityMeetingDetailResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityMeetingResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmDealResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityMeetingContactDao;
import com.skapp.community.crmplanner.repository.CrmActivityMeetingDao;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.service.CrmActivityMeetingService;
import com.skapp.community.crmplanner.service.CrmOwnerResolverService;
import com.skapp.community.crmplanner.type.CrmActivityMeetingFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityMeetingSort;
import com.skapp.community.crmplanner.util.CrmUtil;
import com.skapp.community.crmplanner.util.CrmValidations;
import com.skapp.community.peopleplanner.model.Employee;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmActivityMeetingServiceImpl implements CrmActivityMeetingService {

	private final CrmActivityMeetingDao crmActivityMeetingDao;

	private final CrmActivityMeetingContactDao crmActivityMeetingContactDao;

	private final UserService userService;

	private final TimeZoneService timeZoneService;

	private final CrmMapper crmMapper;

	private final CrmContactDao crmContactDao;

	private final CrmDealDao crmDealDao;

	private final CrmCompanyDao crmCompanyDao;

	private final CrmOwnerResolverService crmOwnerResolver;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getMeetings(CrmActivityMeetingFilterDto filterDto) {
		log.info("getMeetings: execution started");

		User currentUser = userService.getCurrentUser();
		CrmActivityMeetingSort sortKey = filterDto.getSortKey() != null ? filterDto.getSortKey()
				: CrmActivityMeetingSort.START_AT;

		CrmActivityMeetingFilterParams params = new CrmActivityMeetingFilterParams();
		params.setSortKey(sortKey);
		boolean isRepresentative = CrmUtil.isCrmSalesRepresentative(currentUser);
		params.setCurrentEmployeeId(currentUser.getEmployee().getEmployeeId());
		params.setIsRestrictedToOwner(isRepresentative);

		params.setOwnerId(filterDto.getOwnerId());
		if (!StringUtils.isNullOrBlank(filterDto.getSearchKeyword())) {
			params.setSearchPattern(
					"%" + StringUtils.escapeLikePattern(filterDto.getSearchKeyword().toLowerCase()) + "%");
		}
		Sort.Direction defaultSortOrder = sortKey == CrmActivityMeetingSort.OWNER ? Sort.Direction.ASC
				: Sort.Direction.DESC;
		params.setSortOrder(filterDto.getSortOrder() != null ? filterDto.getSortOrder() : defaultSortOrder);

		ZoneId zone = timeZoneService.requestTimezone();
		if (filterDto.getStartDate() != null) {
			params.setRangeStart(filterDto.getStartDate().atStartOfDay(zone).toInstant());
		}
		if (filterDto.getEndDate() != null) {
			params.setRangeEnd(filterDto.getEndDate().plusDays(1).atStartOfDay(zone).toInstant());
		}

		List<CrmActivityMeetingResponseDto> meetings = crmActivityMeetingDao.findMeetings(params);

		log.info("getMeetings: execution ended");
		return new ResponseEntityDto(false, meetings);
	}

	@Override
	@Transactional
	public ResponseEntityDto createMeeting(CrmActivityMeetingCreateRequestDto requestDto) {
		log.info("createMeeting: execution started");

		CrmValidations.validateMeetingSubject(requestDto.getName());
		CrmValidations.validateMeetingDate(requestDto.getMeetingDate());
		CrmValidations.validateMeetingTimes(requestDto.getStartAt(), requestDto.getEndAt());
		CrmValidations.validateMeetingAttendeeIds(requestDto.getContactIds());

		User currentUser = userService.getCurrentUser();
		Employee owner = requestDto.getOwnerId() != null
				? crmOwnerResolver.resolveOwner(requestDto.getOwnerId(), currentUser) : currentUser.getEmployee();

		CrmActivityMeeting meeting = new CrmActivityMeeting();
		meeting.setName(requestDto.getName());
		meeting.setIsScheduled(false);
		meeting.setMeetingDate(requestDto.getMeetingDate());
		meeting.setStartAt(requestDto.getStartAt());
		meeting.setEndAt(requestDto.getEndAt());
		meeting.setComments(requestDto.getComments());
		meeting.setOwner(owner);

		List<CrmContact> contacts = crmContactDao.findByIdInAndIsDeletedFalseOrderByIdAsc(requestDto.getContactIds());
		if (contacts.size() != requestDto.getContactIds().size()) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND);
		}

		if (requestDto.getDealId() != null) {
			CrmDeal deal = crmDealDao.findByIdAndIsDeletedFalse(requestDto.getDealId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND));
			if (CrmValidations.isOwnerRestrictedForRepresentative(currentUser, deal.getOwner().getEmployeeId())) {
				throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_VIEW_DENIED);
			}
			CrmValidations.validateMeetingDealMatchesAttendeeCompanies(deal, contacts);
			meeting.setDeal(deal);
		}

		if (requestDto.getCompanyId() != null) {
			CrmCompany company = crmCompanyDao.findByIdAndIsDeletedFalse(requestDto.getCompanyId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_COMPANY_NOT_FOUND));
			meeting.setCompany(company);
		}

		CrmActivityMeeting savedMeeting = crmActivityMeetingDao.save(meeting);

		List<CrmActivityMeetingContact> attendees = contacts.stream().map(contact -> {
			CrmActivityMeetingContact attendee = new CrmActivityMeetingContact();
			attendee.setId(new CrmActivityMeetingContactId(savedMeeting.getId(), contact.getId()));
			attendee.setMeeting(savedMeeting);
			attendee.setContact(contact);
			return attendee;
		}).toList();
		crmActivityMeetingContactDao.saveAll(attendees);

		CrmActivityMeetingResponseDto response = crmMapper
			.crmActivityMeetingToCrmActivityMeetingResponseDto(savedMeeting);
		response.setContactIds(contacts.stream().map(CrmContact::getId).toList());

		log.info("createMeeting: execution ended");
		return new ResponseEntityDto(false, response);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getMeetingById(Long id) {
		log.info("getMeetingById: execution started");

		CrmActivityMeeting meeting = crmActivityMeetingDao.findMeetingById(id);
		if (meeting == null) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_ACTIVITY_MEETING_NOT_FOUND);
		}

		User currentUser = userService.getCurrentUser();
		if (CrmValidations.isOwnerRestrictedForRepresentative(currentUser, meeting.getOwner().getEmployeeId())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_ACTIVITY_MEETING_VIEW_DENIED);
		}

		CrmActivityMeetingDetailResponseDto response = crmMapper
			.crmActivityMeetingToCrmActivityMeetingDetailResponseDto(meeting);
		response.setContacts(meeting.getContacts()
			.stream()
			.map(CrmActivityMeetingContact::getContact)
			.filter(contact -> !Boolean.TRUE.equals(contact.getIsDeleted()))
			.map(crmMapper::crmContactToCrmContactLookupResponseDto)
			.toList());
		if (meeting.getDeal() != null && Boolean.TRUE.equals(meeting.getDeal().getIsDeleted())) {
			response.setDeal(null);
		}
		else if (meeting.getDeal() != null) {
			response.setDeal(CrmUtil.toDealResponseDto(crmMapper, meeting.getDeal()));
		}
		if (meeting.getCompany() != null && Boolean.TRUE.equals(meeting.getCompany().getIsDeleted())) {
			response.setCompany(null);
		}

		CrmDealResponseDto deal = response.getDeal();
		if (deal != null && CrmValidations.isOwnerRestrictedForRepresentative(currentUser, deal.getOwnerId())) {
			CrmDealResponseDto restrictedDeal = new CrmDealResponseDto();
			restrictedDeal.setId(deal.getId());
			restrictedDeal.setOwnerId(deal.getOwnerId());
			response.setDeal(restrictedDeal);
		}

		log.info("getMeetingById: execution ended");
		return new ResponseEntityDto(false, response);
	}

}
