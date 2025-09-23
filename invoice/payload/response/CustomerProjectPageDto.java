package com.skapp.enterprise.invoice.payload.response;

import com.skapp.community.common.payload.response.PageDto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerProjectPageDto extends PageDto {

	private Long lastProjectId;

}
