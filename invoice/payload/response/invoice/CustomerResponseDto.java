package com.skapp.enterprise.invoice.payload.response.invoice;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CustomerResponseDto {

	private Long id;

	private String name;

	private String email;

	private String phone;

	private String address;

	private String city;

	private String state;

	private String postalCode;

	private String country;

}
