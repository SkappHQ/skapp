package com.skapp.community.crmplanner.payload.response;

import com.skapp.community.crmplanner.type.CrmContactMetrics;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CrmContactListItemDto {

	private Long id;

	private String name;

	private String email;

	private String contactNumber;

	private Instant lastContactAt;

	private Instant lastModifiedDate;

	private Long companyId;

	private Long ownerId;

	private CrmContactMetrics metrics;

}
