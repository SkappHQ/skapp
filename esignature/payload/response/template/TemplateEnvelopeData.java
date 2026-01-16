package com.skapp.enterprise.esignature.payload.response.template;

import com.skapp.enterprise.esignature.payload.response.AddressBookBasicResponseDto;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class TemplateEnvelopeData {

	private Long id;

	private String name;

	private AddressBookBasicResponseDto owner;

	private LocalDate createdDate;

	private LocalDate lastModifiedDate;

}
