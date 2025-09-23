package com.skapp.enterprise.invoice.payload.request;

import com.skapp.enterprise.invoice.type.ProjectMemberSortKey;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

@Getter
@Setter
public class ProjectMemberFilterDto {

	private ProjectMemberSortKey sortKey = ProjectMemberSortKey.NAME;

	private Sort.Direction sortOrder = Sort.Direction.ASC;

	private Long customerId;

	private Long projectId;

	private String searchKeyword;

	public Sort.Direction getSortOrder() {
		return sortOrder != null ? sortOrder : Sort.Direction.ASC;
	}

}
