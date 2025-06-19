package com.skapp.enterprise.esignature.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EnvelopeTierLimitationResponseDto {

	private long remainingCount;

	private long allocatedCount;

	private boolean isLimitedReached;

}
