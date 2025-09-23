package com.skapp.enterprise.invoice.payload.response;

import com.skapp.enterprise.invoice.type.BillableFrequency;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectMembersResponseDto {

	private Long id;

	private Long employeeId;

	private String name;

	private String authPic;

	private String jobTitle;

	private Double billableRate;

	private BillableFrequency billableFrequency;

}
