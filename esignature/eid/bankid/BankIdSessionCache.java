package com.skapp.enterprise.esignature.eid.bankid;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory cache for transient BankID session data that should never be persisted to the
 * database.
 *
 * <p>
 * BankID's qrStartSecret, qrStartToken, and autoStartToken are short-lived values only
 * needed during an active verification session (~30 seconds). Per BankID documentation,
 * the qrStartSecret must remain server-side only and should not be stored permanently.
 * </p>
 *
 * <p>
 * Entries are automatically evicted after {@link #ENTRY_TTL_SECONDS} seconds.
 * </p>
 *
 * @see <a href="https://developers.bankid.com/how-to-guides/qr-code">BankID QR Code
 * Guide</a>
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "skapp.esign.eid.providers.swedish-bankid.enabled", havingValue = "true")
public class BankIdSessionCache {

	/**
	 * Time-to-live for cache entries. BankID sessions last ~30 seconds, so 120 seconds
	 * gives generous headroom for edge cases.
	 */
	private static final long ENTRY_TTL_SECONDS = 120;

	private final Map<String, BankIdCacheEntry> cache = new ConcurrentHashMap<>();

	/**
	 * Stores transient session data in the cache.
	 * @param sessionUuid the session UUID used as cache key
	 * @param qrStartToken the QR start token from BankID
	 * @param qrStartSecret the QR start secret from BankID (never persisted to DB)
	 * @param autoStartToken the auto-start token for same-device launch
	 */
	public void put(String sessionUuid, String qrStartToken, String qrStartSecret, String autoStartToken) {
		cache.put(sessionUuid, new BankIdCacheEntry(qrStartToken, qrStartSecret, autoStartToken, Instant.now()));
		log.debug("BankIdSessionCache: stored transient data for session={}", sessionUuid);
	}

	/**
	 * Retrieves the cached transient data for a session.
	 * @param sessionUuid the session UUID
	 * @return the cached entry, or empty if not found or expired
	 */
	public Optional<BankIdCacheEntry> get(String sessionUuid) {
		BankIdCacheEntry entry = cache.get(sessionUuid);
		if (entry == null) {
			return Optional.empty();
		}
		if (isExpired(entry)) {
			cache.remove(sessionUuid);
			return Optional.empty();
		}
		return Optional.of(entry);
	}

	/**
	 * Removes the cached data for a session. Call this when a session reaches a terminal
	 * state (verified, failed, expired, cancelled).
	 * @param sessionUuid the session UUID
	 */
	public void evict(String sessionUuid) {
		cache.remove(sessionUuid);
		log.debug("BankIdSessionCache: evicted transient data for session={}", sessionUuid);
	}

	private boolean isExpired(BankIdCacheEntry entry) {
		return Instant.now().isAfter(entry.getCreatedAt().plusSeconds(ENTRY_TTL_SECONDS));
	}

}
