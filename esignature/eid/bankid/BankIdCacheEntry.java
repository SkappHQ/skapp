package com.skapp.enterprise.esignature.eid.bankid;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Holds the transient BankID session data. The QR/token fields are immutable (set once at
 * initiation); hintCode is updated on each poll.
 */
@Getter
@Setter
@RequiredArgsConstructor
public class BankIdCacheEntry {

	private final String qrStartToken;

	private final String qrStartSecret;

	private final String autoStartToken;

	private final Instant createdAt;

	private volatile String hintCode;

}
