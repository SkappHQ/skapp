package com.skapp.community.okrplanner.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.okrplanner.constant.OkrMessageConstant;
import com.skapp.community.okrplanner.mapper.CompanyObjectiveMapper;
import com.skapp.community.okrplanner.model.CompanyObjective;
import com.skapp.community.okrplanner.payload.request.CompanyObjectiveFilterDto;
import com.skapp.community.okrplanner.payload.request.CompanyObjectiveRequestDto;
import com.skapp.community.okrplanner.repository.CompanyObjectiveDao;
import com.skapp.community.okrplanner.repository.OkrConfigDao;
import com.skapp.community.okrplanner.service.CompanyObjectiveService;
import com.skapp.community.okrplanner.util.OkrUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompanyObjectiveServiceImpl implements CompanyObjectiveService {

	private final CompanyObjectiveDao companyObjectiveDao;

	private final CompanyObjectiveMapper companyObjectiveMapper;

	private final OkrConfigDao okrConfigDao;

	@Override
	public ResponseEntityDto loadCompanyObjectivesByYear(CompanyObjectiveFilterDto companyObjectiveFilterDto) {
		log.info("loadCompanyObjectivesByYear: execution started");
		List<CompanyObjective> companyObjectives = companyObjectiveDao
			.findAllByYear(companyObjectiveFilterDto.getYear());
		log.info("loadCompanyObjectivesByYear: execution ended");
		return new ResponseEntityDto(false, companyObjectives);
	}

	@Override
	public ResponseEntityDto findCompanyObjectiveById(Long id) {
		log.info("findCompanyObjectiveById: execution started");
		Optional<CompanyObjective> companyObjective = companyObjectiveDao.findById(id);
		if (companyObjective.isEmpty()) {
			throw new EntityNotFoundException(OkrMessageConstant.OKR_ERROR_COMPANY_OBJECTIVE_NOT_FOUND);
		}
		log.info("findCompanyObjectiveById: execution ended");
		return new ResponseEntityDto(false, companyObjective);
	}

	@Override
	@Transactional
	public ResponseEntityDto createCompanyObjective(CompanyObjectiveRequestDto requestDto) {
		log.info("createCompanyObjective: execution started");

		// Validate time period against OKR frequency
		boolean isValid = OkrUtil.isValidTimePeriod(requestDto.getTimePeriod(),
				okrConfigDao.findFirstBy().orElse(null));
		if (!isValid) {
			log.error(String.format("Time period %s not allowed for configured OKR frequency",
					requestDto.getTimePeriod()));
			throw new ModuleException(OkrMessageConstant.OKR_ERROR_TIME_PERIOD_DOES_NOT_MATCH_FREQUENCY);
		}

		CompanyObjective companyObjective = companyObjectiveMapper
			.companyObjectiveRequestDtoToCompanyObjective(requestDto);
		companyObjectiveDao.save(companyObjective);

		log.info("createCompanyObjective: execution ended");
		return new ResponseEntityDto(false, companyObjective);
	}

	@Override
	@Transactional
	public ResponseEntityDto updateCompanyObjective(Long id, CompanyObjectiveRequestDto companyObjectiveRequestDto) {
		log.info("updateCompanyObjective: execution started");

		Optional<CompanyObjective> optionalCompanyObjective = companyObjectiveDao.findById(id);
		if (optionalCompanyObjective.isEmpty()) {
			throw new EntityNotFoundException(OkrMessageConstant.OKR_ERROR_COMPANY_OBJECTIVE_NOT_FOUND);
		}
		CompanyObjective companyObjective = optionalCompanyObjective.get();
		if (companyObjectiveRequestDto.getTimePeriod() != null) {
			if (!OkrUtil.isValidTimePeriod(companyObjectiveRequestDto.getTimePeriod(),
					okrConfigDao.findFirstBy().orElse(null))) {
				log.error(String.format("Time period %s not allowed for configured OKR frequency",
						companyObjectiveRequestDto.getTimePeriod()));
				throw new ModuleException(OkrMessageConstant.OKR_ERROR_TIME_PERIOD_DOES_NOT_MATCH_FREQUENCY);
			}
			companyObjective.setTimePeriod(companyObjectiveRequestDto.getTimePeriod());
		}
		if (companyObjectiveRequestDto.getTitle() != null
				&& !companyObjectiveRequestDto.getTitle().equalsIgnoreCase(companyObjective.getTitle())) {
			companyObjective.setTitle(companyObjectiveRequestDto.getTitle());
		}
		if (companyObjectiveRequestDto.getDescription() != null
				&& !companyObjectiveRequestDto.getDescription().equalsIgnoreCase(companyObjective.getDescription())) {
			companyObjective.setDescription(companyObjectiveRequestDto.getDescription());
		}
		if (companyObjectiveRequestDto.getYear() != null) {
			companyObjective.setYear(companyObjectiveRequestDto.getYear());
		}
		companyObjective = companyObjectiveDao.save(companyObjective);

		log.info("updateCompanyObjective: execution ended");
		return new ResponseEntityDto(false, companyObjective);
	}

}
