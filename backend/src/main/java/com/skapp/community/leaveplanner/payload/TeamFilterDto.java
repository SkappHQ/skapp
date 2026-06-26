package com.skapp.community.leaveplanner.payload;

import com.skapp.community.common.type.TeamSort;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

@Getter
@Setter
public class TeamFilterDto {

	@Min(0)
	private int page = 0;

	@Min(1)
	private int size = 4;

	private Boolean isExport = false;

	private Sort.Direction sortOrder = Sort.Direction.ASC;

	private TeamSort sortKey = TeamSort.TEAM_NAME;

}
