package com.skapp.enterprise.invoice.payload.response;

import com.skapp.enterprise.invoice.type.BillableFrequency;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ImportTimeLogsResponseDto {

	private String description;

	private Double quantity;

	private BillableFrequency unit;

	private Double rate;

	private Double amount;

}
