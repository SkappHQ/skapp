package com.skapp.community.crmplanner.service.v2.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.model.CrmIndustry;
import com.skapp.community.crmplanner.payload.request.CrmIndustryCreateDto;
import com.skapp.community.crmplanner.payload.response.v2.CrmIndustryCreateResponseDtoV2;
import com.skapp.community.crmplanner.repository.CrmIndustryDao;
import com.skapp.community.crmplanner.service.v2.CrmIndustryServiceV2;
import com.skapp.community.crmplanner.util.CrmValidations;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmIndustryServiceImplV2 implements CrmIndustryServiceV2 {

	private final CrmIndustryDao crmIndustryDao;

	@Override
	@Transactional
	public ResponseEntityDto createIndustry(CrmIndustryCreateDto requestDto) {
		log.info("createIndustry: execution started");

		CrmValidations.validateIndustryName(requestDto.getName());
		String normalizedName = CrmValidations.normalizeIndustryName(requestDto.getName());

		// Re-checked here rather than trusting the client: its list can be stale, so two
		// users can submit the same name from separate forms within the same window.
		Optional<CrmIndustry> existingIndustry = crmIndustryDao.findByNameIgnoreCaseAndIsDeletedFalse(normalizedName);

		if (existingIndustry.isPresent()) {
			CrmIndustry industry = existingIndustry.get();
			log.info("createIndustry: industry {} already exists, returning existing record", industry.getId());
			return new ResponseEntityDto(false,
					new CrmIndustryCreateResponseDtoV2(industry.getId(), industry.getName(), true));
		}

		CrmIndustry industry = new CrmIndustry();
		industry.setName(normalizedName);
		crmIndustryDao.save(industry);

		log.info("createIndustry: execution ended");
		return new ResponseEntityDto(false,
				new CrmIndustryCreateResponseDtoV2(industry.getId(), industry.getName(), false));
	}

}
