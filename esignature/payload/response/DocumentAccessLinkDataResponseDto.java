package com.skapp.enterprise.esignature.payload.response;

import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentAccessLinkDataResponseDto {

	private String name;

	private String email;

	private String senderEmail;

	private Long envelopeId;

	private String subject;

	private EnvelopeStatus envelopeStatus;

	private RecipientResponseDto recipientResponseDto;

	private List<FieldResponseDto> fieldResponseDtoList;

	private List<FieldContainerResponseDto> fieldContainerResponseDtoList;

	private DocumentDetailResponseDto documentDetailResponseDto;

	private DocumentLinkResponseDto documentLinkResponseDto;

}
