package com.skapp.community.crmplanner.payload.response;

import java.util.List;

import com.skapp.community.crmplanner.model.CrmCompany;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmCompanyDomainSearchResponseDto {

    private List<CrmCompany> companies;

}
