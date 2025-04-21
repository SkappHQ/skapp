package com.skapp.enterprise.esignature.payload.response;

import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EnvelopeInfoResponseDto {

	private Long id;

	private String subject;

	private EnvelopeStatus status;

	private List<DocumentDetailResponseDto> documents;

	private List<RecipientResponseDto> recipients;

	private AddressBookBasicResponseDto addressBook;

}
