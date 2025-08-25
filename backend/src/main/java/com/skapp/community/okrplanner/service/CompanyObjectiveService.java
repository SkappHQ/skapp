package com.skapp.community.okrplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.okrplanner.payload.request.CompanyObjectiveRequestDto;

public interface CompanyObjectiveService {

    ResponseEntityDto loadCompanyObjectivesByYear(Integer year);

    ResponseEntityDto findCompanyObjectiveById(Long id);

    ResponseEntityDto createCompanyObjective(CompanyObjectiveRequestDto requestDto);

    ResponseEntityDto editCompanyObjective();

    ResponseEntityDto deleteCompanyObjective(Long id);
}
