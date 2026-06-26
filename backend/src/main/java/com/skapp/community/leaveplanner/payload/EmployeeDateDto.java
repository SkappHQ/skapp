package com.skapp.community.leaveplanner.payload;

import com.skapp.community.peopleplanner.model.Employee;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@AllArgsConstructor
@Getter
public class EmployeeDateDto {

	private Employee employee;

	private LocalDateTime creationDate;

}
