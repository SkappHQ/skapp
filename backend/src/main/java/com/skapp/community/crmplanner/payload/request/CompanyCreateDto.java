package com.skapp.community.crmplanner.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CompanyCreateDto {

  @NotBlank(message = "Company name is required")
  private String name;

  private String industry;

  private String website;

  private String address;

  private String contactNumber;

  private String createdBy;

  private String lastModifiedBy;
}
