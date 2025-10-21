package com.skapp.enterprise.invoice.payload.email;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceReminderEmailDynamicFields {

	private String sentBy;

	private String customerName;

	private String invoiceId;

	private String invoiceDate;

	private String dueDate;

	private String totalAmount;

	private String subject;

	private String body;

}
