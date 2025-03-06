package com.skapp.enterprise.esignature.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EnvelopeSettingDto {

	private Integer reminderDays;

	private LocalDate expirationDate;

}
