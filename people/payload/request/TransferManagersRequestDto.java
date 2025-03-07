package com.skapp.enterprise.people.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransferManagersRequestDto {

	private Long managerId;

	private Long transferredManagerId;

}
