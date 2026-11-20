package com.skapp.community.leaveplanner.payload;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LeaveApprovalConfigDto {

	@NotNull
	private Boolean isMultiLevelApprovalEnabled;

}
