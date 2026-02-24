package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.leaveplanner.model.LeaveType;
import com.skapp.community.leaveplanner.type.GainEligibilityType;
import com.skapp.community.leaveplanner.type.LeaveRuleCategory;
import com.skapp.community.leaveplanner.type.LoseEligibilityType;
import lombok.Getter;
import lombok.Setter;
import tools.jackson.databind.JsonNode;

import java.time.LocalDate;

@Getter
@Setter
public class LeaveTypeRuleResponseDto {

	private Long ruleId;

	private String name;

	private LeaveRuleCategory leaveRuleCategory;

	private LeaveType leaveType;

	private GainEligibilityType gainEligibilityType;

	private LoseEligibilityType loseEligibilityType;

	private int earnDays;

	private JsonNode earnDaysGrid;

	private LocalDate validFrom;

	private LocalDate validTo;

}
