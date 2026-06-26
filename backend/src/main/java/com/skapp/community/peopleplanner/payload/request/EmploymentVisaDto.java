package com.skapp.community.peopleplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EmploymentVisaDto {

	private Long visaId;

	private String visaType;

	private String issuingCountry;

	private LocalDate issuedDate;

	private LocalDate expirationDate;

}
