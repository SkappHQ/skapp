package com.skapp.enterprise.invoice.payload.request.invoice;

import com.skapp.enterprise.invoice.type.InvoiceStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class InvoiceStatusUpdateRequestDto {

	private Long invoiceId;

	private InvoiceStatus status;

}
