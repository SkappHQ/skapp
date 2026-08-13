package com.skapp.community.leaveplanner.payload;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PolicyLeaveDateWindowDto {

	private LocalDate startDate;

	private LocalDate endDate;

}
