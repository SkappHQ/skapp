package com.skapp.community.leaveplanner.payload;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OnLeaveByTeamDto {

	private Long onLeaveCount;

	private Long onlineCount;

	private List<EmployeeLeaveRequestListResponseDto> onLeaveEmployeeLeaveRequestResponseDtos;

}
