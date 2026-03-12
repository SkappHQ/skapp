package com.skapp.enterprise.common.payload.request;

import com.skapp.enterprise.common.type.Tier;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdditionalDetailsDto {

	private List<Tier> tiers;

	private String tenantStatus;

}
