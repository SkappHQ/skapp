package com.skapp.enterprise.leaveplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EpLeaveInsightContextResponseDto {

	private int leaveWarningWindowDays;

	private int capacityDropThresholdPct;

	private int teamSize;

	private int membersOnLeaveCount;

	private int pctTeamOnLeave;

	private List<EpLeaveInsightMemberDto> teamMembers;

}
