package com.skapp.community.okrplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.okrplanner.constant.OkrMessageConstant;
import com.skapp.community.okrplanner.mapper.CompanyObjectiveMapper;
import com.skapp.community.okrplanner.model.CompanyObjective;
import com.skapp.community.okrplanner.payload.request.CompanyObjectiveRequestDto;
import com.skapp.community.okrplanner.repository.CompanyObjectiveRepository;
import com.skapp.community.okrplanner.repository.OkrConfigDao;
import com.skapp.community.okrplanner.service.CompanyObjectiveService;
import com.skapp.community.okrplanner.type.OkrTimePeriod;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompanyObjectiveServiceImpl implements CompanyObjectiveService {

    private final CompanyObjectiveRepository companyObjectiveRepository;
    private final CompanyObjectiveMapper companyObjectiveMapper;
    private final OkrConfigDao okrConfigDao;

    @Override
    public ResponseEntityDto loadCompanyObjectivesByYear(Integer year) {
        return null;
    }

    @Override
    public ResponseEntityDto findCompanyObjectiveById(Long id) {
        return null;
    }

    @Override
    @Transactional
    public ResponseEntityDto createCompanyObjective(CompanyObjectiveRequestDto requestDto) {
        log.info("createCompanyObjective: execution started");

        // Validate time period against OKR frequency
        boolean isValid = isValidTimePeriod(requestDto.getTimePeriod());
        if (!isValid) {
            log.error(String.format("Time period %s not allowed for configured OKR frequency", requestDto.getTimePeriod()));
            throw new ModuleException(OkrMessageConstant.OKR_TIME_PERIOD_DOES_NOT_MATCH_FREQUENCY);
        }

        CompanyObjective companyObjective = companyObjectiveMapper.companyObjectiveRequestDtoToCompanyObjective(requestDto);
        companyObjectiveRepository.save(companyObjective);

        log.info("createCompanyObjective: execution ended");
        return new ResponseEntityDto(false, companyObjective);
    }

    @Override
    public ResponseEntityDto editCompanyObjective() {
        return null;
    }

    @Override
    public ResponseEntityDto deleteCompanyObjective(Long id) {
        return null;
    }

    private Boolean isValidTimePeriod(OkrTimePeriod requestedTimePeriod) {
        return okrConfigDao.findFirstBy()
                .map(config -> {
                    List<OkrTimePeriod> allowedPeriods = OkrTimePeriod.getByType(config.getFrequency());
                    return allowedPeriods.contains(requestedTimePeriod);
                })
                .orElse(false);
    }
}
