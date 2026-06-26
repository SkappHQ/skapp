package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.leaveplanner.payload.CustomEntitlementDto;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EntitlementBasicDetailsDto {

	private String firstName;

	private String lastName;

	private Long employeeId;

	private String authPic;

	private String email;

	private List<CustomEntitlementDto> entitlements;

}
