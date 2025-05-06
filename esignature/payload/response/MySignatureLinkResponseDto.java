package com.skapp.enterprise.esignature.payload.response;

import com.skapp.enterprise.esignature.type.MySignatureMethods;
import com.skapp.enterprise.esignature.type.UserType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MySignatureLinkResponseDto {

	private Long addressBookId;

	private Long userId;

	private UserType type;

	private String firstName;

	private String lastName;

	private String mySignatureLink;

	private MySignatureMethods mySignatureMethod;

	private String fontFamily;

	private String fontColor;

}
