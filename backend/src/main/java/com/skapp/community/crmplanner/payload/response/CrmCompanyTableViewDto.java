package com.skapp.community.crmplanner.payload.response;

import java.math.BigDecimal;

import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@Setter
@AllArgsConstructor
public class CrmCompanyTableViewDto {

  private Long id;
  private String name;
  private String contactNumber;
  private Long tasks;
  private Long overdue;
  private BigDecimal openValue;
  private BigDecimal accountValue;
  private Long closedDeals;

  private String industry;
  private String website;
  private String address;
}
