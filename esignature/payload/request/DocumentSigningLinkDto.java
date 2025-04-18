package com.skapp.enterprise.esignature.payload.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentSigningLinkDto {

	private Integer expirationHours;

	private Integer maxClicks;

}
