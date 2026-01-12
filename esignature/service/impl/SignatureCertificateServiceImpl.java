package com.skapp.enterprise.esignature.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.repository.OrganizationDao;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.mapper.EsignMapper;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.AuditTrail;
import com.skapp.enterprise.esignature.model.DocumentLink;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.payload.response.AuditTrailResponseDto;
import com.skapp.enterprise.esignature.payload.response.MetadataResponseDto;
import com.skapp.enterprise.esignature.payload.response.SignatureCertificateResponseDto;
import com.skapp.enterprise.esignature.repository.AddressBookDao;
import com.skapp.enterprise.esignature.repository.AuditTrailDao;
import com.skapp.enterprise.esignature.repository.EnvelopeDao;
import com.skapp.enterprise.esignature.repository.RecipientDao;
import com.skapp.enterprise.esignature.service.DocumentLinkService;
import com.skapp.enterprise.esignature.service.SignatureCertificateService;
import com.skapp.enterprise.esignature.util.EsignUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SignatureCertificateServiceImpl implements SignatureCertificateService {

	private final EnvelopeDao envelopeDao;

	private final AuditTrailDao auditTrailDao;

	private final OrganizationDao organizationDao;

	private final EsignMapper eSignMapper;

	private final UserService userService;

	private final DocumentLinkService documentLinkService;

	private final RecipientDao recipientDao;

	private final AddressBookDao addressBookDao;

	@Override
	public byte[] generateCertificatePdfBytes(Long envelopeId, boolean isDocAccess, Envelope envelope)
			throws IOException {
		log.info("generateCertificatePdfBytes: execution started for envelopeId {}", envelopeId);

		validateUser(envelopeId, isDocAccess);

		List<AuditTrail> auditTrails = auditTrailDao.findByEnvelopeIdOrderByTimestampAsc(envelopeId);

		SignatureCertificateResponseDto responseDto = eSignMapper.envelopeToSignatureCertificateResponseDto(envelope);

		List<AuditTrailResponseDto> responseDtoList = auditTrails.stream().map(auditTrail -> {
			AuditTrailResponseDto auditTrailResponseDto = new AuditTrailResponseDto();
			auditTrailResponseDto.setAuditId(auditTrail.getId());
			auditTrailResponseDto.setAction(auditTrail.getAction());
			auditTrailResponseDto.setMetadata(new ObjectMapper().convertValue(auditTrail.getMetadata(),
					new TypeReference<List<MetadataResponseDto>>() {
					}));
			auditTrailResponseDto.setIsAuthorized(auditTrail.getIsAuthorized());
			auditTrailResponseDto.setHash(auditTrail.getHash());
			if (auditTrail.getRecipient() == null && auditTrail.getAddressBookUser() == null) {
				auditTrailResponseDto.setActionDoneByName("");
				auditTrailResponseDto.setActionDoneByEmail("");
			}
			else if (auditTrail.getRecipient() == null) {
				auditTrailResponseDto.setActionDoneByName(auditTrail.getAddressBookUser().getName());
				auditTrailResponseDto.setActionDoneByEmail(auditTrail.getAddressBookUser().getEmail());
			}
			else {
				auditTrailResponseDto.setActionDoneByName(auditTrail.getRecipient().getAddressBook().getName());
				auditTrailResponseDto.setActionDoneByEmail(auditTrail.getRecipient().getAddressBook().getEmail());
			}
			auditTrailResponseDto.setTimestamp(auditTrail.getTimestamp());
			return auditTrailResponseDto;
		}).toList();

		organizationDao.findTopByOrderByOrganizationIdDesc()
			.ifPresent(org -> responseDto.setOrganizationTimeZone(org.getOrganizationTimeZone()));
		responseDto.setAuditTrails(responseDtoList);

		String html = generateSignatureCertificateHtml(responseDto);

		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		PdfRendererBuilder builder = new PdfRendererBuilder();
		builder.withHtmlContent(html, null);
		builder.toStream(baos);
		builder.run();
		byte[] pdfBytes = baos.toByteArray();
		log.info("generateCertificatePdfBytes: execution ended for envelopeId {}", envelopeId);
		return pdfBytes;
	}

	private void validateUser(Long envelopeId, boolean isDocAccess) {
		if (isDocAccess) {
			// Document access via token validation
			DocumentLink documentLinkFromToken = documentLinkService.getDocumentLinkFromToken();
			Long addressBookId = documentLinkFromToken.getRecipientId().getAddressBook().getId();

			if (recipientDao.findByEnvelopeIdAndAddressBookId(envelopeId, addressBookId).isEmpty()) {
				throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
			}
		}
		else {
			// Internal user access validation
			User currentUser = userService.getCurrentUser();
			if (currentUser == null) {
				throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
			}

			Role esignRole = currentUser.getEmployee().getEmployeeRole().getEsignRole();
			boolean isAdmin = esignRole.equals(Role.ESIGN_ADMIN);

			// Admins have automatic access, other users need validation
			if (!isAdmin) {
				// Check if user is a recipient
				AddressBook currentAddressBookUser = getCurrentAddressBookUser(currentUser.getEmail());
				if (currentAddressBookUser == null) {
					throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_USER_NOT_FOUND);
				}

				boolean isRecipient = !recipientDao
					.findByEnvelopeIdAndAddressBookId(envelopeId, currentAddressBookUser.getId())
					.isEmpty();

				if (!isRecipient) {
					// Check if user is the envelope owner
					AddressBook ownerAddressBook = envelopeDao.findById(envelopeId)
						.map(Envelope::getOwner)
						.orElseThrow(
								() -> new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_NOT_FOUND));

					boolean isEnvelopeOwner = ownerAddressBook.getInternalUser() != null
							&& ownerAddressBook.getInternalUser().getUserId().equals(currentUser.getUserId());

					if (!isEnvelopeOwner) {
						throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
					}
				}
			}
		}
	}

	private String generateSignatureCertificateHtml(SignatureCertificateResponseDto responseDto) {
		try {
			ClassPathResource resource = new ClassPathResource(
					"enterprise/templates/pdf/en/esignature/signature-certificate-v1.html");
			String template = new String(Files.readAllBytes(Paths.get(resource.getURI())), StandardCharsets.UTF_8);

			// Replace basic document information
			template = template.replace("{{documentName}}", EsignUtil.escapeHtml(responseDto.getName()));
			template = template.replace("{{documentUuid}}", EsignUtil.escapeHtml(responseDto.getUuid()));

			// Replace status information
			String statusClass = EsignUtil.getStatusClass(responseDto.getStatus());
			String statusLabel = EsignUtil.getStatusLabel(responseDto.getStatus());
			template = template.replace("{{statusClass}}", statusClass);
			template = template.replace("{{statusLabel}}", statusLabel);

			// Replace meta information
			template = template.replace("{{senderName}}", EsignUtil.escapeHtml(responseDto.getOwner().getName()));
			template = template.replace("{{enclosedDocuments}}",
					EsignUtil.escapeHtml(responseDto.getDocuments().getFirst().getName()));
			template = template.replace("{{dateCreated}}",
					formatDate(responseDto.getSentAt(), responseDto.getOrganizationTimeZone()));
			template = template.replace("{{timeZone}}",
					EsignUtil.escapeHtml(getTimeZoneWithOffset(responseDto.getOrganizationTimeZone())));

			// Replace recipients
			String recipients = responseDto.getRecipients()
				.stream()
				.map(recipient -> recipient.getAddressBook().getFirstName() + " "
						+ recipient.getAddressBook().getLastName())
				.collect(Collectors.joining(", "));
			template = template.replace("{{recipients}}", EsignUtil.escapeHtml(recipients));

			// Process audit trails
			template = processAuditTrails(template, responseDto);

			return template;

		}
		catch (IOException e) {
			log.error("Error loading signature certificate template", e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_GENERATE_SIGNATURE_CERTIFICATE_PDF);
		}
	}

	private String processAuditTrails(String template, SignatureCertificateResponseDto responseDto) {
		String startMarker = "{{#auditTrails}}";
		String endMarker = "{{/auditTrails}}";

		int startIndex = template.indexOf(startMarker);
		int endIndex = template.indexOf(endMarker);

		if (startIndex == -1 || endIndex == -1) {
			return template;
		}

		String auditTemplate = template.substring(startIndex + startMarker.length(), endIndex);

		StringBuilder auditHtmlBuilder = new StringBuilder();
		if (responseDto.getAuditTrails() != null && !responseDto.getAuditTrails().isEmpty()) {
			for (AuditTrailResponseDto audit : responseDto.getAuditTrails()) {
				auditHtmlBuilder.append(
						auditTemplate
							.replace("{{timestamp}}",
									EsignUtil.escapeHtml(formatTimestamp(audit.getTimestamp(),
											responseDto.getOrganizationTimeZone())))
							.replace("{{userEmail}}", EsignUtil.escapeHtml(audit.getActionDoneByEmail()))
							.replace("{{activity}}", EsignUtil.escapeHtml(EsignUtil.getFormattedActionText(audit))));
			}
		}

		return template.substring(0, startIndex) + auditHtmlBuilder + template.substring(endIndex + endMarker.length());
	}

	private String formatDate(LocalDateTime dateTimeUtc, String timeZone) {
		if (dateTimeUtc == null) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_DATE_TIME_CANNOT_BE_NULL);
		}

		ZoneId targetZone = ZoneId.of(timeZone);
		ZonedDateTime zonedDateTime = dateTimeUtc.atZone(ZoneOffset.UTC).withZoneSameInstant(targetZone);

		return DateTimeUtils.formatDateTimeEsignCert(zonedDateTime.toLocalDateTime());
	}

	private String formatTimestamp(Instant instant, String timeZone) {
		if (instant == null) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_DATE_TIME_CANNOT_BE_NULL);
		}
		ZoneId zoneId = ZoneId.of(timeZone);
		LocalDateTime localDateTime = LocalDateTime.ofInstant(instant, zoneId);
		return DateTimeUtils.formatDateTimeEsignCert(localDateTime);
	}

	private String getTimeZoneWithOffset(String timeZoneId) {
		ZoneId zone = ZoneId.of(timeZoneId);
		ZoneOffset offset = zone.getRules().getOffset(Instant.now());
		String offsetId = offset.getId().replace("Z", "+00:00");
		return "(" + "GMT" + offsetId + ") " + timeZoneId;
	}

	private AddressBook getCurrentAddressBookUser(String email) {
		return addressBookDao.findByInternalUserEmail(email)
			.orElseGet(() -> addressBookDao.findByExternalUserEmail(email).orElse(null));
	}

}
