package com.skapp.enterprise.esignature.type;

import java.util.List;

public enum AuditAction {

	ENVELOPE_CREATED, // Envelope creation
	ENVELOPE_SENT, // Envelope sent from sender's end
	ENVELOPE_RECEIVED, // Each recipient receiving the envelope
	ENVELOPE_VIEWED, // viewing the envelope
	ENVELOPE_SIGNED, // Recipient signing the envelope
	ENVELOPE_DECLINED, // Envelope declined from signer's end
	ENVELOPE_VOIDED, // Envelope voided from sender's end
	ENVELOPE_EDITED, // Envelope edited/changed from sender's end
	ENVELOPE_EXPIRED, // Envelope expired
	ENVELOPE_DOWNLOADED, // Envelope downloaded by recipient
	ENVELOPE_COMPLETED, // Full envelope completion (all recipients finished)
	ENVELOPE_CUSTODY_TRANSFERRED, // Envelope ownership/custody transferred
	ENVELOPE_IDENTITY_VERIFIED_SWEDISH_BANKID; // Identity verified via Swedish BankID

	public static boolean isWebAllowedAction(AuditAction action) {
		return List.of(ENVELOPE_VIEWED, ENVELOPE_DOWNLOADED).contains(action);
	}

}
