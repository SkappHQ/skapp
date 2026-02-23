package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.masterrepository.TenantDao;
import com.skapp.enterprise.common.model.master.Tenant;
import com.skapp.enterprise.common.type.SubscriptionStatus;
import com.skapp.enterprise.common.type.Tier;
import com.skapp.enterprise.common.util.TierStartEndDateExtractor;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.payload.response.EnvelopeTierLimitationResponseDto;
import com.skapp.enterprise.esignature.payload.response.EsignTierValidationDto;
import com.skapp.enterprise.esignature.repository.EnvelopeDao;
import com.skapp.enterprise.esignature.service.EsignTierValidationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class EsignTierValidationServiceImpl implements EsignTierValidationService {

	@Value("${esign.envelope.allocated-free-tier-envelope-count}")
	private long allocatedFreeTierEnvelopeCount;

	@Value("${esign.envelope.allocated-per-user-envelope-count}")
	private long allocatedPerUserEnvelopeCount;

	private final TenantContext tenantContext;

	private final TenantDao tenantDao;

	private final EnvelopeDao envelopeDao;

	private final EmployeeDao employeeDao;

	@Override
	public EsignTierValidationDto resolveTierContext() {
		String currentTenant = TenantContext.getCurrentTenant();
		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);

		try {
			Tenant tenant = tenantDao.findByTenantName(currentTenant);
			if (tenant == null) {
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_NOT_FOUND,
						new String[] { currentTenant });
			}
			return new EsignTierValidationDto(tenant);
		}
		finally {
			tenantContext.setTenantAndSwitchSchema(currentTenant);
		}
	}

	@Override
	public EnvelopeTierLimitationResponseDto processEnvelopeTierLimitation(
			EsignTierValidationDto esignTierValidationDto) {
		String currentTenant = TenantContext.getCurrentTenant();
		try {
			long employeeCount = employeeDao
				.countByAccountStatusIn(Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING));

			EnvelopeTierLimitationResponseDto envelopeTierLimitationResponseDto = new EnvelopeTierLimitationResponseDto();
			Tier tier = esignTierValidationDto.getTier();

			LocalDateTime startDateTime;
			LocalDateTime endDateTime;
			long allocatedCount;

			if (tier == Tier.FREE) {
				LocalDate tierStartedDate = DateTimeUtils
					.fromUtcInstantToLocaldate(esignTierValidationDto.getCreatedDate());
				startDateTime = TierStartEndDateExtractor.getYearlyTierStartDate(tierStartedDate);
				endDateTime = TierStartEndDateExtractor.getYearlyTierEndDate(startDateTime, tierStartedDate);

				long envelopeCount = envelopeDao.countBySentAtGreaterThanEqualAndSentAtLessThan(startDateTime,
						endDateTime);
				allocatedCount = allocatedFreeTierEnvelopeCount;

				envelopeTierLimitationResponseDto.setAllocatedCount(allocatedCount);
				envelopeTierLimitationResponseDto.setRemainingCount(Math.max(allocatedCount - envelopeCount, 0));
				envelopeTierLimitationResponseDto.setLimitedReached(envelopeCount >= allocatedFreeTierEnvelopeCount);
			}
			else if (tier == Tier.PRO) {

				if (esignTierValidationDto.getStripeSubscription() == null
						|| esignTierValidationDto.getStripeSubscription().getSubscriptionStartDate() == null) {
					throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SUBSCRIPTION_NOT_FOUND);
				}
				LocalDate tierStartedDate = DateTimeUtils.fromUtcInstantToLocaldate(
						esignTierValidationDto.getStripeSubscription().getSubscriptionStartDate());

				startDateTime = TierStartEndDateExtractor.getYearlyTierStartDate(tierStartedDate);
				endDateTime = TierStartEndDateExtractor.getYearlyTierEndDate(startDateTime, tierStartedDate);

				long envelopeCount = envelopeDao.countBySentAtGreaterThanEqualAndSentAtLessThan(startDateTime,
						endDateTime);

				allocatedCount = Math.max(envelopeCount, employeeCount * allocatedPerUserEnvelopeCount);
				long remainingCount = allocatedCount - envelopeCount;

				envelopeTierLimitationResponseDto.setAllocatedCount(allocatedCount);
				envelopeTierLimitationResponseDto.setRemainingCount(Math.max(remainingCount, 0));
				envelopeTierLimitationResponseDto
					.setLimitedReached(envelopeCount >= (employeeCount * allocatedPerUserEnvelopeCount));
			}
			return envelopeTierLimitationResponseDto;
		}
		catch (Exception e) {
			log.error("Error while fetching envelope tier limitations for tenant {}: {}", currentTenant, e.getMessage(),
					e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FETCHING_ENVELOPE_TIER_LIMITATIONS);
		}
		finally {
			tenantContext.setTenantAndSwitchSchema(currentTenant);
		}
	}

}
