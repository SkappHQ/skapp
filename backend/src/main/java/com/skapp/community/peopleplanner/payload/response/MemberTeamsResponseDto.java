package com.skapp.community.peopleplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class MemberTeamsResponseDto {

	private Long employeeId;

	private List<Long> teamIds;

}
