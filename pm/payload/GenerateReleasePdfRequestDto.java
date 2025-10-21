package com.skapp.enterprise.pm.payload;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class GenerateReleasePdfRequestDto {

	private Long id;

	private String name;

	private String description;

	private String environment;

	private String projectName;

	private LocalDateTime releaseDate;

	private LocalDateTime startDate;

	private String status;

	private Long projectId;

	private List<ProjectItemDto> projectItems;

	private List<ApproverDto> approvers;

}
