package com.skapp.enterprise.esignature.payload.request;

import com.skapp.enterprise.esignature.type.EmailReminderStatus;
import com.skapp.enterprise.esignature.type.EmailStatus;
import com.skapp.enterprise.esignature.type.RecipientStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RecipientUpdateDto {

	private RecipientStatus status;

	private String reminderBatchId;

	private EmailReminderStatus reminderStatus;

	private EmailStatus emailStatus;

}
