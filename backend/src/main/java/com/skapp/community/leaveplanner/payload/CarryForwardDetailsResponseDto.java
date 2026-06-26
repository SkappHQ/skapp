package com.skapp.community.leaveplanner.payload;

import com.skapp.community.peopleplanner.payload.response.EmployeeResponseDto;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CarryForwardDetailsResponseDto {

	private EmployeeResponseDto employee;

	private List<CarryForwardEntitlementDto> entitlements;

}
