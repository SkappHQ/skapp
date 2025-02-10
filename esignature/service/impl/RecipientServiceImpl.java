package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.mapper.EsignMapper;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.payload.response.DocumentDetailResponseDto;
import com.skapp.enterprise.esignature.payload.response.EnvelopeDetailedResponseDto;
import com.skapp.enterprise.esignature.payload.response.RecipientDetailResponseDto;
import com.skapp.enterprise.esignature.repository.RecipientRepository;
import com.skapp.enterprise.esignature.service.EnvelopRecipientEmailService;
import com.skapp.enterprise.esignature.service.RecipientService;
import com.skapp.enterprise.esignature.type.MemberRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class RecipientServiceImpl implements RecipientService {

	private final RecipientRepository recipientRepository;

	private final EnvelopRecipientEmailService envelopRecipientEmailService;

	private final EsignMapper eSignMapper;

	@Override
	public ResponseEntityDto findNextRecipientAndSendEmail(Optional<Long> recipientId, Long envelopeId) {

		log.info("findNextRecipient: execution started");

		EnvelopeDetailedResponseDto responseDto = null;

		Optional<List<Recipient>> recipientListOptional = recipientRepository.findByEnvelopeId(envelopeId);

		// If no recipients found for the given Document Id, return an empty response
		if (recipientListOptional.isEmpty()) {
			log.info("findNextRecipient: next recipient for envelop ID {} not found", envelopeId);
			return new ResponseEntityDto(false, responseDto);
		}

		List<Recipient> recipientList = recipientListOptional.get();

		List<Recipient> sortedRecipientList = new ArrayList<>();

		// When the very first recipient is not known the recipientId is optional. In that
		// case if the recipientId is not available
		// order the recipient list first from the id and then from the signingOrder and
		// add to the sortedRecipientList list
		if (recipientId.isPresent()) {
			int currentSigningOrderId = recipientList.stream()
				.filter(rec -> rec.getId().compareTo(recipientId.get()) == 0)
				.toList()
				.getFirst()
				.getSigningOrder();

			sortedRecipientList.addAll(recipientList.stream()
				.filter(recpt -> recpt.getSigningOrder() > currentSigningOrderId)
				.sorted(Comparator.comparing(Recipient::getSigningOrder))
				.toList());
		}
		else {
			sortedRecipientList.addAll(recipientList.stream()
				.sorted(Comparator.comparing(Recipient::getId).thenComparing(Recipient::getSigningOrder))
				.toList());
		}

		// If no next available recipient available, return an empty response
		if (sortedRecipientList.isEmpty()) {
			log.info("findNextRecipient: next recipient for envelop ID {} not found", envelopeId);
			return new ResponseEntityDto(false, responseDto);
		}

		List<Recipient> tempRecipientList = new ArrayList<>(sortedRecipientList);
		List<Recipient> nextRecipientList = new ArrayList<>();

		// List derive based on the member role. If next in line recipient is a CC role,
		// then pick the recipient list up until the next Signer to send simultaneously.
        for (Recipient currentRecipient : tempRecipientList) {
            if (MemberRole.SIGNER.equals(currentRecipient.getMemberRole())) {
                nextRecipientList.add(currentRecipient);

                break;

            } else if (MemberRole.CC.equals(currentRecipient.getMemberRole())) {
                nextRecipientList.add(currentRecipient);
            }
        }

		List<RecipientDetailResponseDto> recipientDetailResponseDtoList = new ArrayList<>();
		List<DocumentDetailResponseDto> documentDetailResponseDtoList = new ArrayList<>();

		nextRecipientList.forEach(nxtRecpt -> {
			RecipientDetailResponseDto recipientDetailResponseDto = eSignMapper.recipientToRecipientDetailDto(nxtRecpt);
			recipientDetailResponseDtoList.add(recipientDetailResponseDto);
		});

		nextRecipientList.getFirst().getEnvelope().getDocuments().forEach(document -> {
			DocumentDetailResponseDto documentDetailResponseDto = eSignMapper.documentToDocumentDetailDto(document);
			documentDetailResponseDtoList.add(documentDetailResponseDto);
		});

		EnvelopeDetailedResponseDto envelopeDetailedResponseDto = eSignMapper
			.envelopeToEnvelopeDetailedResponseDto(nextRecipientList.getFirst().getEnvelope());
		envelopeDetailedResponseDto.setRecipients(recipientDetailResponseDtoList);
		envelopeDetailedResponseDto.setDocuments(documentDetailResponseDtoList);

		log.info("findNextRecipient: execution ended");

		// After obtaining the next in line recipient, implement the email sender
		log.info("sendEnvelopToRecipientEmail: process started");

		envelopeDetailedResponseDto.getRecipients().forEach(recipient -> {
			envelopRecipientEmailService.sendEnvelopToRecipientEmail(recipient.getName(), recipient.getEmail(),
					recipient.getMemberRole().toString(), envelopeDetailedResponseDto);
		});

		log.info("sendEnvelopToRecipientEmail: process ended");

		// change the response
		return new ResponseEntityDto(false, envelopeDetailedResponseDto);

	}

}
