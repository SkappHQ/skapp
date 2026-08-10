package com.skapp.community.peopleplanner.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class BirthdayNotificationViewedResponseDto {

	private LocalDate lastViewedDate;

}
