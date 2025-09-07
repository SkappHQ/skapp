package com.skapp.enterprise.invoice.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceTierLimitationResponseDto {

	private long remainingCount;

	private long allocatedCount;

	private boolean isLimitedReached;

}
