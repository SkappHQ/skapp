package com.skapp.community.peopleplanner.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class BirthdayNotificationResponseDto {

	private LocalDate lastViewedDate;

	private List<EmployeeBirthdayResponseDto> employeeBirthdays;

}
