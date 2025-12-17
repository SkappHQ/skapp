package com.skapp.enterprise.common.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectRequestDto {

	private Long projectId;

	private String projectName;

	private String projectKey;

}
