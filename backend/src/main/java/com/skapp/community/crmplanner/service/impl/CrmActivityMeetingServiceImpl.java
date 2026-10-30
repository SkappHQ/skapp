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
import com.skapp.community.crmplanner.payload.request.CrmActivityMeetingFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityMeetingDetailResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityMeetingResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmDealResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityMeetingDao;
import com.skapp.community.crmplanner.service.CrmActivityMeetingService;
import com.skapp.community.crmplanner.type.CrmActivityMeetingFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityMeetingSort;
import com.skapp.community.crmplanner.util.CrmUtil;
import com.skapp.community.crmplanner.util.CrmValidations;
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

	private final UserService userService;

	private final TimeZoneService timeZoneService;

	private final CrmMapper crmMapper;

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
