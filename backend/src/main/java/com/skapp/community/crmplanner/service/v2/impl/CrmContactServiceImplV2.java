package com.skapp.community.crmplanner.service.v2.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapperV2;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.payload.request.CrmContactCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmContactEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmContactFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmContactMetricRequestDto;
import com.skapp.community.crmplanner.payload.response.v2.CrmContactLookupResponseDtoV2;
import com.skapp.community.crmplanner.payload.response.v2.CrmContactMetricsResponseDtoV2;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.service.CrmContactService;
import com.skapp.community.crmplanner.service.v2.CrmContactServiceV2;
import com.skapp.community.crmplanner.util.CrmUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmContactServiceImplV2 implements CrmContactServiceV2 {

	private final CrmContactService crmContactService;

	private final CrmContactDao crmContactDao;

	private final CrmMapperV2 crmMapperV2;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getContactMetrics(CrmContactMetricRequestDto filterDto) {
		log.info("getContactMetrics: execution started");

		Pageable pageable = PageRequest.of(filterDto.getPage(), filterDto.getSize());
		Page<CrmContactMetricsResponseDtoV2> contactPage = crmContactDao.getContactMetricsV2(filterDto, pageable);

		PageDto pageDto = new PageDto();
		pageDto.setItems(contactPage.getContent());
		pageDto.setCurrentPage(contactPage.getNumber());
		pageDto.setTotalItems(contactPage.getTotalElements());
		pageDto.setTotalPages(contactPage.getTotalPages());

		log.info("getContactMetrics: execution ended");
		return new ResponseEntityDto(false, pageDto);
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

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getContactsLookup(CrmContactFilterDto filterDto) {
		log.info("getContactsLookup: execution started");

		Pageable pageable = PageRequest.of(filterDto.getPage(), filterDto.getSize());
		Page<CrmContact> contactPage = crmContactDao.findContactsForLookup(filterDto, pageable);

		List<CrmContactLookupResponseDtoV2> items = contactPage.getContent().stream().map(this::toLookupDto).toList();

		PageDto pageDto = new PageDto();
		pageDto.setItems(items);
		pageDto.setCurrentPage(contactPage.getNumber());
		pageDto.setTotalItems(contactPage.getTotalElements());
		pageDto.setTotalPages(contactPage.getTotalPages());

		log.info("getContactsLookup: execution ended");
		return new ResponseEntityDto(false, pageDto);
	}

	private CrmContactLookupResponseDtoV2 toLookupDto(CrmContact contact) {
		CrmContactLookupResponseDtoV2 dto = crmMapperV2.crmContactToCrmContactLookupResponseDtoV2(contact);
		if (CrmUtil.hasDeletedCompany(contact)) {
			dto.setCompanyId(null);
		}
		return dto;
	}

}
