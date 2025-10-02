package com.skapp.enterprise.invoice.payload.response.project;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TenantProjectResourceWiseTimeLogDto {

	private Double billableTime;

	private Double totalTime;

	private Long userId;

}
