package com.skapp.enterprise.invoice.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ReminderEmailRequestDto {

	private Long invoiceId;

	private String subject;

	private String to;

	private List<String> ccEmails;

	private String body;

}
