package com.skapp.enterprise.esignature.payload.response;

import com.skapp.enterprise.esignature.type.UserType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddressBookResponseDto {

	private Long id;

	private InternalUserResponseDto internalUserResponseDto;

	private ExternalUserResponseDto externalUserResponseDto;

	private UserType type;

}
