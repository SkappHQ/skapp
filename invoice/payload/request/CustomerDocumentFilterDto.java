package com.skapp.enterprise.invoice.payload.request;

import com.skapp.enterprise.invoice.type.DocumentSortKey;
import com.skapp.enterprise.invoice.type.DocumentStatus;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

@Getter
@Setter

public class CustomerDocumentFilterDto {

	private Long customerId;

	private String name;

	private DocumentStatus documentStatus = DocumentStatus.UPLOADED;

	private int page = 0;

	private int size = 10;

	private DocumentSortKey sortKey = DocumentSortKey.ID;

	private Sort.Direction sortOrder = Sort.Direction.ASC;

}
