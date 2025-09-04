package com.skapp.enterprise.invoice.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerContactResponseDto {

	private Long id;

	private String name;

	private String email;

	private String contactNo;

	private String jobTitle;

}
