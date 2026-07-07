package com.skapp.community.common.service;

/**
 * Field-level encryption port for PII columns at rest, backing the JPA
 * {@link com.skapp.community.common.util.converter.FieldEncryptionConverter}.
 *
 * <p>
 * This interface lives in {@code community} so community entities can opt into field
 * encryption without depending on the {@code enterprise} module (which is a separate git
 * submodule). The implementation is supplied at runtime:
 * </p>
 *
 * <ul>
 * <li><b>Community builds</b> get the default no-op implementation (the community
 * {@code FieldEncryptionServiceImpl}), which stores and reads values as plain text.</li>
 * <li><b>Enterprise builds</b> get the KMS-backed, envelope-encryption implementation,
 * which writes the wire format {@code ENC:<alias>:<base64(IV + ciphertext + GCM tag)>}
 * and is fail-closed. It replaces the no-op via {@code @Primary}.</li>
 * </ul>
 */
public interface FieldEncryptionService {

	/**
	 * Encrypts a plaintext value for storage. A {@code null} input returns {@code null}.
	 * The no-op community implementation returns the value unchanged.
	 * @param plaintext the value to encrypt
	 * @return the value to persist (ciphertext in enterprise builds, plaintext otherwise)
	 */
	String encrypt(String plaintext);

	/**
	 * Reverses {@link #encrypt(String)} for a stored value. A {@code null} input returns
	 * {@code null}. The no-op community implementation returns the value unchanged.
	 * @param dbValue the stored value
	 * @return the decrypted plaintext (or the value unchanged in community builds)
	 */
	String decrypt(String dbValue);

}
