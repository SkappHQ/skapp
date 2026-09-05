package com.skapp.community.crmplanner.payload.response.v2;

import com.skapp.community.crmplanner.payload.response.CrmCompanyResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmOwnerResponseDto;
import com.skapp.community.crmplanner.type.CrmContactMetrics;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class CrmContactMetricsResponseDtoV2 {

	private Long id;

	private String name;

	private String email;

	private String contactNumber;

	private LocalDateTime lastContactAt;

	private LocalDateTime lastModifiedDate;

	private CrmCompanyResponseDto company;

	private CrmOwnerResponseDto owner;

	private CrmContactMetrics metrics;

}
