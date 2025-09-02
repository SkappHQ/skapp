package com.skapp.community.okrplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.okrplanner.payload.request.CompanyObjectiveFilterDto;
import com.skapp.community.okrplanner.payload.request.CompanyObjectiveRequestDto;
import jakarta.validation.Valid;

public interface CompanyObjectiveService {

	ResponseEntityDto loadCompanyObjectivesByYear(@Valid CompanyObjectiveFilterDto companyObjectiveFilterDto);

	ResponseEntityDto findCompanyObjectiveById(Long id);

	ResponseEntityDto createCompanyObjective(CompanyObjectiveRequestDto requestDto);

	ResponseEntityDto updateCompanyObjective(Long id, CompanyObjectiveRequestDto companyObjectiveRequestDto);

}
