package com.skapp.enterprise.esignature.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignLinkDataResponseDto {

	private String name;

	private String email;

	private Long envelopeId;

	private RecipientResponseDto recipientResponseDto;

	private List<FieldResponseDto> fieldResponseDtoList;

	private TemporaryLinkResponseDto temporaryLinkResponseDto;

}
