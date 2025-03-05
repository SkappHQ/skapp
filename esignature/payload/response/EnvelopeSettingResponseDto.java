package com.skapp.enterprise.esignature.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EnvelopeSettingResponseDto {

	private Long id;

	private Integer reminderDays;

	private LocalDate expirationDate;

}
