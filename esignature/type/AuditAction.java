package com.skapp.enterprise.esignature.type;

public enum AuditAction {

	ENVELOPE_CREATED, // Envelope creation
	ENVELOPE_SENT, // Envelope sent from sender's end
	ENVELOPE_RECEIVED, // Each recipient receiving the envelope
	ENVELOPE_VIEWED, //  viewing the envelope
	ENVELOPE_SIGNED, // Recipient signing the envelope
	ENVELOPE_DECLINED, // Envelope declined from signer's end
	ENVELOPE_VOIDED, // Envelope voided from sender's end
	ENVELOPE_EDITED, // Envelope edited/changed from sender's end
	ENVELOPE_EXPIRED, // Envelope expired
	ENVELOPE_DOWNLOADED, // Envelope downloaded by recipient
	ENVELOPE_COMPLETED // Full envelope completion (all recipients finished)

}
