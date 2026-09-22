package com.skapp.community.leaveplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BulkAssignLeavePolicyRequestDto {

	private List<BulkAssignPolicyRowDto> assignments;

}
