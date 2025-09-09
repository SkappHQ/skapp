package com.skapp.enterprise.invoice.payload.request;

import com.skapp.enterprise.invoice.type.CustomerStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerStatusUpdateRequestDto {

	private CustomerStatus status;

}
