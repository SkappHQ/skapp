package com.skapp.enterprise.invoice.payload.request.invoice;

import com.skapp.enterprise.invoice.type.BillableFrequency;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeamMemberBillableRateUpdateRequestDto {

	private Long id;

	private Double billableRate;

	private BillableFrequency billableFrequency;

}
