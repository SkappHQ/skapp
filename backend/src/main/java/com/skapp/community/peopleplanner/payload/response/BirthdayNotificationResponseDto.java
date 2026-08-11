package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.peopleplanner.payload.request.EmployeeBasicDetailsResponseDto;
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

	private List<EmployeeBasicDetailsResponseDto> employeeBirthdays;

}
