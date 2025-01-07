package com.skapp.enterprise.common.payload;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class CreateTenantDto {

	private String schema;

	private AppClientDto appClientDto;

}
