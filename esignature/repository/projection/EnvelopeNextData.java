package com.skapp.enterprise.esignature.repository.projection;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EnvelopeNextData {

	private Long envelopeId;

	private String subject;

	private String senderEmail;

	private LocalDate expiresAt;

	private LocalDateTime sentAt;

}
