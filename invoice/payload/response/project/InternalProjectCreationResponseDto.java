package com.skapp.enterprise.invoice.payload.response.project;

import com.skapp.enterprise.invoice.payload.response.InternalCustomerResponseDto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InternalProjectCreationResponseDto {

	private Long projectId;

	private InternalCustomerResponseDto customer;

}
