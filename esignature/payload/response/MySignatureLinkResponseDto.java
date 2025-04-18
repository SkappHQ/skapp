package com.skapp.enterprise.esignature.payload.response;

import com.skapp.enterprise.esignature.type.UserType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MySignatureLinkResponseDto {

	private Long id;

	private Long internalExternalUserId;

	private UserType type;

	private String mySignatureLink;

}
