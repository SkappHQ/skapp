package com.skapp.enterprise.invoice.payload.request;

import com.skapp.enterprise.invoice.type.ProjectSortKey;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

@Getter
@Setter
public class ProjectFilterDto {

	private String cursor = null;

	@Min(-1)
	private int limit = -1;

	private ProjectSortKey sortKey = ProjectSortKey.NAME;

	private Sort.Direction sortOrder = Sort.Direction.ASC;

	private String search = null;

	public Sort.Direction getSortOrder() {
		return sortOrder != null ? sortOrder : Sort.Direction.ASC;
	}

}
