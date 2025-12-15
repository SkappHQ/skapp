package com.skapp.enterprise.invoice.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InternalProjectCreationRequestDto {

	private Long projectId;

	private Long customerId;

}
