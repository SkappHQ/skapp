package com.skapp.enterprise.esignature.payload.request;

import com.skapp.enterprise.esignature.type.MySignatureMethods;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MySignatureLinkDto {

	private String mySignatureLink;

	private MySignatureMethods mySignatureMethod;

}
