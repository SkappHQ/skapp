package com.skapp.community.leaveplanner.payload.request;

import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PolicyLeaveCancelRequestDto {

	@NotNull
	private LeaveRequestStatus status;

}
