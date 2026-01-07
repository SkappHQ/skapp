package com.skapp.enterprise.pm.payload;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectItemDto {

	private Long id;

	private Long itemNumber;

	private String title;

	private String description;

	private String type;

	private String icon;

	private Integer estimation;

	private Boolean isDeleted;

}
