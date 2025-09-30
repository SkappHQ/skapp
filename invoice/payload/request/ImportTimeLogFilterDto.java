package com.skapp.enterprise.invoice.payload.request;

import com.skapp.enterprise.invoice.type.ImportTimeLogGroupKey;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ImportTimeLogFilterDto {

	private Long projectId;

	private LocalDate startDate;

	private LocalDate endDate;

	private ImportTimeLogGroupKey groupBy = ImportTimeLogGroupKey.RESOURCE;

	private Boolean roundOff;

}
