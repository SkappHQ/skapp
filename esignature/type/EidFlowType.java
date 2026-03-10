package com.skapp.enterprise.esignature.type;

/**
 * Distinguishes which BankID endpoint was used to create an eID verification session.
 *
 * <p>
 * AUTH sessions use the /auth endpoint (identity-only, no document hash). SIGN sessions
 * use the /sign endpoint (cryptographically bound to a document hash).
 * </p>
 */
public enum EidFlowType {

	AUTH,

	SIGN

}
