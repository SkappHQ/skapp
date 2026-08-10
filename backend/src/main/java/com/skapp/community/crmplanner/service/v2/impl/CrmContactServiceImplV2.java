package com.skapp.community.crmplanner.service.v2.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapperV2;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.payload.request.CrmContactCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmContactEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmContactMetricRequestDto;
import com.skapp.community.crmplanner.payload.response.v2.CrmContactListItemDtoV2;
import com.skapp.community.crmplanner.payload.response.v2.CrmContactResponseDtoV2;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.repository.CrmTaskDao;
import com.skapp.community.crmplanner.service.CrmContactService;
import com.skapp.community.crmplanner.service.v2.CrmContactServiceV2;
import com.skapp.community.crmplanner.type.CrmContactMetrics;
import com.skapp.community.crmplanner.type.CrmDealSummary;
import com.skapp.community.crmplanner.type.CrmTaskSummary;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmContactServiceImplV2 implements CrmContactServiceV2 {

	private final CrmContactService crmContactService;

	private final CrmContactDao crmContactDao;

	private final CrmDealDao crmDealDao;

	private final CrmTaskDao crmTaskDao;

	private final CrmMapperV2 crmMapperV2;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getContactMetrics(CrmContactMetricRequestDto filterDto) {
		log.info("getContactMetrics: execution started");

		Pageable pageable = PageRequest.of(filterDto.getPage(), filterDto.getSize());
		Page<CrmContact> contactPage = crmContactDao.findContacts(filterDto, pageable);

		List<Long> contactIds = contactPage.getContent().stream().map(CrmContact::getId).toList();

		if (contactIds.isEmpty()) {
			log.info("getContactMetrics: execution ended");
			return new ResponseEntityDto(false, buildPageDto(List.of(), contactPage));
		}

		Map<Long, CrmDealSummary> dealSummaryMap = crmDealDao.findClosedDealSummaryByContactIds(contactIds)
			.stream()
			.collect(Collectors.toMap(CrmDealSummary::getContactId, Function.identity()));

		Map<Long, CrmTaskSummary> taskSummaryMap = crmTaskDao.findOpenTaskSummaryByContactIds(contactIds)
			.stream()
			.collect(Collectors.toMap(CrmTaskSummary::getContactId, Function.identity()));

		List<CrmContactListItemDtoV2> items = contactPage.getContent()
			.stream()
			.map(contact -> enrichWithMetrics(contact, dealSummaryMap, taskSummaryMap))
			.toList();

		log.info("getContactMetrics: execution ended");
		return new ResponseEntityDto(false, buildPageDto(items, contactPage));
	}

	private CrmContactListItemDtoV2 enrichWithMetrics(CrmContact contact, Map<Long, CrmDealSummary> dealSummaryMap,
			Map<Long, CrmTaskSummary> taskSummaryMap) {
		CrmContactResponseDtoV2 contactDto = crmMapperV2.crmContactToCrmContactResponseDtoV2(contact);

		CrmDealSummary deals = dealSummaryMap.get(contact.getId());
		CrmTaskSummary tasks = taskSummaryMap.get(contact.getId());

		CrmContactMetrics metrics = new CrmContactMetrics(
				(deals != null ? deals.getTotalClosedValue() : BigDecimal.ZERO).toPlainString(),
				deals != null ? deals.getClosedDealCount() : 0L, tasks != null ? tasks.getOpenTaskCount() : 0L,
				tasks != null ? tasks.getOverdueTaskCount() : 0L);

		return new CrmContactListItemDtoV2(contactDto, metrics);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getContactById(Long id) {
		log.info("getContactById: execution started");

		CrmContact contact = crmContactDao.findByIdWithAssociations(id);
		if (contact == null) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND);
		}

		log.info("getContactById: execution ended");
		return new ResponseEntityDto(false, crmMapperV2.crmContactToCrmContactResponseDtoV2(contact));
	}

	@Override
	@Transactional
	public ResponseEntityDto createContact(CrmContactCreateRequestDto requestDto) {
		log.info("createContact: execution started");

		CrmContact savedContact = crmContactService.persistNewContact(requestDto);

		log.info("createContact: execution ended");
		return new ResponseEntityDto(false, crmMapperV2.crmContactToCrmContactResponseDtoV2(savedContact));
	}

	@Override
	@Transactional
	public ResponseEntityDto editContact(Long id, CrmContactEditRequestDto requestDto) {
		log.info("editContact: execution started");

		CrmContact savedContact = crmContactService.applyContactEdit(id, requestDto);

		log.info("editContact: execution ended");
		return new ResponseEntityDto(false, crmMapperV2.crmContactToCrmContactResponseDtoV2(savedContact));
	}

	private PageDto buildPageDto(List<CrmContactListItemDtoV2> items, Page<CrmContact> contactPage) {
		PageDto pageDto = new PageDto();
		pageDto.setItems(items);
		pageDto.setCurrentPage(contactPage.getNumber());
		pageDto.setTotalItems(contactPage.getTotalElements());
		pageDto.setTotalPages(contactPage.getTotalPages());
		return pageDto;
	}

}
