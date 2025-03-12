package com.skapp.enterprise.common.payload.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdditionalDetailsDto {

	private String tier;

	private String tenantStatus;

}
