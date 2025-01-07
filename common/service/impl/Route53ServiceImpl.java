package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpValidationConstants;
import com.skapp.enterprise.common.service.Route53Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.route53.Route53Client;
import software.amazon.awssdk.services.route53.model.AliasTarget;
import software.amazon.awssdk.services.route53.model.Change;
import software.amazon.awssdk.services.route53.model.ChangeAction;
import software.amazon.awssdk.services.route53.model.ChangeBatch;
import software.amazon.awssdk.services.route53.model.ChangeResourceRecordSetsRequest;
import software.amazon.awssdk.services.route53.model.HostedZone;
import software.amazon.awssdk.services.route53.model.ListHostedZonesByNameResponse;
import software.amazon.awssdk.services.route53.model.ListResourceRecordSetsRequest;
import software.amazon.awssdk.services.route53.model.ListResourceRecordSetsResponse;
import software.amazon.awssdk.services.route53.model.RRType;
import software.amazon.awssdk.services.route53.model.ResourceRecordSet;
import software.amazon.awssdk.services.route53.model.Route53Exception;

import java.util.Collections;

@Service
@Slf4j
@RequiredArgsConstructor
public class Route53ServiceImpl implements Route53Service {

	@Value("${aws.route53.parent-domain}")
	private String parentDomain;

	@Value("${aws.route53.load-balancer.hosted-zone}")
	private String loadBalancerHostedZone;

	@Value("${aws.route53.load-balancer.alias-dns-name}")
	private String aliasDnsName;

	private final Route53Client route53Client;

	@Override
	public String getHostedZoneId() {
		try {
			ListHostedZonesByNameResponse hostedZones = route53Client.listHostedZonesByName();
			if (hostedZones.hostedZones().isEmpty()) {
				log.error("No hosted zones found in Route53");
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_NO_HOSTED_ZONES_FOUND);
			}

			return hostedZones.hostedZones()
				.stream()
				.filter(hostedZone -> hostedZone.name().equals(parentDomain + ".")
						|| hostedZone.name().equals(parentDomain))
				.findFirst()
				.map(HostedZone::id)
				.map(id -> id.replace("/hostedzone/", ""))
				.orElseThrow(() -> {
					log.error("Hosted zone not found for domain: {}", parentDomain);
					return new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_HOSTED_ZONE_NOT_FOUND);
				});

		}
		catch (Route53Exception e) {
			log.error("AWS Route53 error while fetching hosted zone id: {}", e.getMessage());
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_FETCHING_HOSTED_ZONE_ID);
		}
		catch (ModuleException e) {
			throw e;
		}
		catch (Exception e) {
			log.error("Unexpected error while fetching hosted zone id: {}", e.getMessage());
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_FETCHING_HOSTED_ZONE_ID);
		}
	}

	@Override
	@Async
	public void createSubdomainForTenant(String subdomainName) {
		validateSubdomain(subdomainName);

		try {
			String hostedZoneId = getHostedZoneId();
			String fullDomainName = subdomainName + "." + parentDomain;

			if (subdomainExists(hostedZoneId, fullDomainName)) {
				log.error("Subdomain already exists: {}", fullDomainName);
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SUBDOMAIN_ALREADY_EXISTS);
			}

			ResourceRecordSet recordSet = ResourceRecordSet.builder()
				.name(fullDomainName)
				.type(RRType.A)
				.aliasTarget(AliasTarget.builder()
					.hostedZoneId(loadBalancerHostedZone)
					.dnsName(aliasDnsName)
					.evaluateTargetHealth(false)
					.build())
				.build();

			Change change = Change.builder().action(ChangeAction.CREATE).resourceRecordSet(recordSet).build();

			ChangeBatch changeBatch = ChangeBatch.builder().changes(Collections.singletonList(change)).build();

			ChangeResourceRecordSetsRequest request = ChangeResourceRecordSetsRequest.builder()
				.hostedZoneId(hostedZoneId)
				.changeBatch(changeBatch)
				.build();

			route53Client.changeResourceRecordSets(request);
			log.info("Successfully created subdomain: {}", fullDomainName);

		}
		catch (Route53Exception e) {
			log.error("AWS Route53 error while creating subdomain: {} - {}", subdomainName, e.getMessage());
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_CREATING_SUBDOMAIN,
					new String[] { subdomainName, e.getMessage() });
		}
		catch (ModuleException e) {
			throw e;
		}
		catch (Exception e) {
			log.error("Unexpected error while creating subdomain: {} - {}", subdomainName, e.getMessage());
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_CREATING_SUBDOMAIN,
					new String[] { subdomainName, e.getMessage() });
		}
	}

	@Override
	public void deleteTenantSubdomain(String subdomainName) {
		try {
			String hostedZoneId = getHostedZoneId();
			String fullDomainName = subdomainName + "." + parentDomain;

			if (!subdomainExists(hostedZoneId, fullDomainName)) {
				log.error("Subdomain does not exist: {}", fullDomainName);
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SUBDOMAIN_NOT_FOUND);
			}

			ResourceRecordSet existingRecord = getSubdomainRecordSet(hostedZoneId, fullDomainName);

			Change change = Change.builder().action(ChangeAction.DELETE).resourceRecordSet(existingRecord).build();

			ChangeBatch changeBatch = ChangeBatch.builder().changes(Collections.singletonList(change)).build();

			ChangeResourceRecordSetsRequest request = ChangeResourceRecordSetsRequest.builder()
				.hostedZoneId(hostedZoneId)
				.changeBatch(changeBatch)
				.build();

			route53Client.changeResourceRecordSets(request);
			log.info("Successfully deleted subdomain: {}", fullDomainName);

		}
		catch (Route53Exception e) {
			log.error("AWS Route53 error while deleting subdomain: {} - {}", subdomainName, e.getMessage());
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_DELETING_SUBDOMAIN);
		}
		catch (ModuleException e) {
			throw e;
		}
		catch (Exception e) {
			log.error("Unexpected error while deleting subdomain: {} - {}", subdomainName, e.getMessage());
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_DELETING_SUBDOMAIN);
		}
	}

	@Override
	public boolean isDomainNotAvailable(String subDomainName) {
		try {
			String hostedZoneId = getHostedZoneId();
			String fullDomainName = subDomainName + "." + parentDomain;

			return subdomainExists(hostedZoneId, fullDomainName);
		}
		catch (Exception e) {
			log.error("Unexpected error while checking domain availability: {} - {}", subDomainName, e.getMessage());
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_CHECKING_DOMAIN_AVAILABILITY);
		}
	}

	private void validateSubdomain(String subdomain) {
		if (subdomain == null || subdomain.trim().isEmpty()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_SUBDOMAIN);
		}

		if (EpValidationConstants.RESTRICTED_SUBDOMAINS.contains(subdomain.toLowerCase())) {
			log.error("Attempted to create restricted subdomain: {}", subdomain);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_RESTRICTED_SUBDOMAIN);
		}
	}

	private boolean subdomainExists(String hostedZoneId, String domainName) {
		try {
			ListResourceRecordSetsRequest request = ListResourceRecordSetsRequest.builder()
				.hostedZoneId(hostedZoneId)
				.build();

			ListResourceRecordSetsResponse response = route53Client.listResourceRecordSets(request);
			return response.resourceRecordSets()
				.stream()
				.anyMatch(recordSet -> recordSet.name().equals(domainName + "."));
		}
		catch (Exception e) {
			log.error("Error checking subdomain existence: {} - {}", domainName, e.getMessage());
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_CHECKING_SUBDOMAIN);
		}
	}

	private ResourceRecordSet getSubdomainRecordSet(String hostedZoneId, String domainName) {
		ListResourceRecordSetsRequest request = ListResourceRecordSetsRequest.builder()
			.hostedZoneId(hostedZoneId)
			.build();

		ListResourceRecordSetsResponse response = route53Client.listResourceRecordSets(request);
		return response.resourceRecordSets()
			.stream()
			.filter(recordSet -> recordSet.name().equals(domainName + "."))
			.findFirst()
			.orElseThrow(() -> new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SUBDOMAIN_NOT_FOUND));
	}

}
