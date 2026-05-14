package com.skapp.enterprise.pm.payload;

import com.skapp.enterprise.pm.type.GuestInvitationValidationStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GuestInvitationValidationResponseDto {

	private String email;

	private GuestInvitationValidationStatus status;

}
