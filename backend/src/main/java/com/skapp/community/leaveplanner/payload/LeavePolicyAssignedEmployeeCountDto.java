package com.skapp.community.leaveplanner.payload;

import com.skapp.community.leaveplanner.model.LeavePolicy;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LeavePolicyAssignedEmployeeCountDto {

	private LeavePolicy leavePolicy;

	private Long assignedEmployeeCount;

}
