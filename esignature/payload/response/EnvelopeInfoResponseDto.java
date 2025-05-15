package com.skapp.enterprise.esignature.payload.response;

import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import com.skapp.enterprise.esignature.type.SignType;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EnvelopeInfoResponseDto {

	private Long id;

	private String subject;

	private EnvelopeStatus status;

	private SignType signType;

	private List<DocumentDetailResponseDto> documents;

	private List<RecipientResponseDto> recipients;

	private AddressBookBasicResponseDto addressBook;

}
