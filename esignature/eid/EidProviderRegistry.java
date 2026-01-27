package com.skapp.enterprise.esignature.eid;

import com.skapp.enterprise.esignature.type.EidProviderType;

import java.util.List;
import java.util.Optional;

/**
 * Registry for managing eID verification providers.
 *
 * This allows multiple providers to be registered and retrieved dynamically, supporting
 * multi-provider environments (e.g., Swedish BankID + Norwegian BankID).
 */
public interface EidProviderRegistry {

	/**
	 * Register a provider with the registry.
	 * @param provider The provider to register
	 */
	void registerProvider(EidProvider provider);

	/**
	 * Get a provider by its type.
	 * @param type The provider type
	 * @return Optional containing the provider, or empty if not registered
	 */
	Optional<EidProvider> getProvider(EidProviderType type);

	/**
	 * Get all currently enabled providers.
	 * @return List of enabled providers
	 */
	List<EidProvider> getEnabledProviders();

	/**
	 * Check if a specific provider type is available and enabled.
	 * @param type The provider type
	 * @return true if available and enabled
	 */
	boolean isProviderAvailable(EidProviderType type);

}
