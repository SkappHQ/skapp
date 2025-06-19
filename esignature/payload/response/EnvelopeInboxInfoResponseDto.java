package com.skapp.enterprise.esignature.payload.response;

import com.skapp.enterprise.esignature.type.InboxStatus;
import com.skapp.enterprise.esignature.type.SignType;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EnvelopeInboxInfoResponseDto {

	private Long id;

	private String subject;

	private InboxStatus status;

	private SignType signType;

	private List<DocumentDetailResponseDto> documents;

	private List<RecipientResponseDto> recipients;

	private AddressBookBasicResponseDto addressBook;

	private AddressBookBasicResponseDto senderAddressBook;

	private String envelopeAccessLink;

}
