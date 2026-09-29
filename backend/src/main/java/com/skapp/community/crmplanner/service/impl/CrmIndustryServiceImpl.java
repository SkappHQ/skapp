package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.CrmIndustry;
import com.skapp.community.crmplanner.payload.request.CrmIndustryFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmIndustryLookupResponseDto;
import com.skapp.community.crmplanner.repository.CrmIndustryDao;
import com.skapp.community.crmplanner.service.CrmIndustryService;
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
public class CrmIndustryServiceImpl implements CrmIndustryService {

	private final CrmIndustryDao crmIndustryDao;

	private final CrmMapper crmMapper;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getIndustriesLookup(CrmIndustryFilterDto filterDto) {
		log.info("getIndustriesLookup: execution started");

		Pageable pageable = PageRequest.of(filterDto.getPage(), filterDto.getSize());
		Page<CrmIndustry> industryPage = crmIndustryDao.findIndustries(filterDto, pageable);

		List<CrmIndustryLookupResponseDto> industryResponseDtos = industryPage.getContent()
			.stream()
			.map(crmMapper::crmIndustryToCrmIndustryLookupResponseDto)
			.toList();

		PageDto pageDto = new PageDto();
		pageDto.setItems(industryResponseDtos);
		pageDto.setCurrentPage(industryPage.getNumber());
		pageDto.setTotalItems(industryPage.getTotalElements());
		pageDto.setTotalPages(industryPage.getTotalPages());

		log.info("getIndustriesLookup: execution ended");
		return new ResponseEntityDto(false, pageDto);
	}

}
