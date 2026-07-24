package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.leaveplanner.type.LeavePolicyStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LeavePolicyStatusResponseDto {

	private Long id;

	private LeavePolicyStatus status;

}
