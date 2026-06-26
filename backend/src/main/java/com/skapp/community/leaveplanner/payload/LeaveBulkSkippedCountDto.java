package com.skapp.community.leaveplanner.payload;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class LeaveBulkSkippedCountDto {

	private int skippedCount;

	public void incrementSkippedCount() {
		this.skippedCount++;
	}

}
