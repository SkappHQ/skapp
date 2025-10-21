package com.skapp.enterprise.invoice.payload.request;

import com.skapp.enterprise.invoice.type.CustomerSortKey;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

@Getter
@Setter
public class CustomerFilterDto {

	@Min(0)
	private int page = 0;

	@Min(-1)
	private int size = -1;

	private CustomerSortKey sortKey = CustomerSortKey.NAME;

	private Sort.Direction sortOrder = Sort.Direction.ASC;

	private String searchKeyword;

	public Sort.Direction getSortOrder() {
		return sortOrder != null ? sortOrder : Sort.Direction.ASC;
	}

}
