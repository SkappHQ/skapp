package com.skapp.enterprise.esignature.eid.provider;

import com.skapp.enterprise.esignature.eid.type.EidProviderType;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Default implementation of EidProviderRegistry.
 *
 * Providers are auto-registered via Spring's dependency injection. Each provider is
 * conditionally loaded based on configuration properties.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EidProviderRegistryImpl implements EidProviderRegistry {

	private final List<EidProvider> availableProviders;

	private final Map<EidProviderType, EidProvider> providerMap = new EnumMap<>(EidProviderType.class);

	@PostConstruct
	public void init() {
		log.info("Initializing EidProviderRegistry with {} providers", availableProviders.size());

		for (EidProvider provider : availableProviders) {
			registerProvider(provider);
		}

		log.info("EidProviderRegistry initialized. Enabled providers: {}",
				getEnabledProviders().stream().map(p -> p.getProviderType().name()).toList());
	}

	@Override
	public void registerProvider(EidProvider provider) {
		EidProviderType type = provider.getProviderType();

		if (providerMap.containsKey(type)) {
			log.warn("Provider {} is already registered, replacing with new instance", type);
		}

		providerMap.put(type, provider);
		log.info("Registered eID provider: {} (enabled: {})", provider.getDisplayName(), provider.isEnabled());
	}

	@Override
	public Optional<EidProvider> getProvider(EidProviderType type) {
		return Optional.ofNullable(providerMap.get(type));
	}

	@Override
	public List<EidProvider> getEnabledProviders() {
		return providerMap.values().stream().filter(EidProvider::isEnabled).toList();
	}

	@Override
	public boolean isProviderAvailable(EidProviderType type) {
		return getProvider(type).map(EidProvider::isEnabled).orElse(false);
	}

}
