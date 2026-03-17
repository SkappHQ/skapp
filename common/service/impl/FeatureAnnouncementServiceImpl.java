package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.type.Role;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.masterrepository.FeatureAnnouncementRecipientDao;
import com.skapp.enterprise.common.model.master.FeatureAnnouncementRecipient;
import com.skapp.enterprise.common.model.master.FeatureAnnouncement;
import com.skapp.enterprise.common.payload.request.AnnouncementListRequestFilterDto;
import com.skapp.enterprise.common.payload.request.AnnouncementStatusUpdateRequestDto;
import com.skapp.enterprise.common.payload.request.FeatureAnnouncementCreateRequestDto;
import com.skapp.enterprise.common.payload.response.AnnouncementPageResponseDto;
import com.skapp.enterprise.common.payload.response.FeatureAnnouncementResponseDto;
import com.skapp.enterprise.common.masterrepository.FeatureAnnouncementDao;
import com.skapp.enterprise.common.service.FeatureAnnouncementService;
import com.skapp.enterprise.common.type.AnnouncementFrequencyType;
import com.skapp.enterprise.common.type.AnnouncementStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class FeatureAnnouncementServiceImpl implements FeatureAnnouncementService {

	private final FeatureAnnouncementDao featureAnnouncementDao;

	private final FeatureAnnouncementRecipientDao featureAnnouncementRecipientDao;

	@Override
	@Transactional
	public ResponseEntityDto createAnnouncement(FeatureAnnouncementCreateRequestDto requestDto) {
		log.debug("Creating feature announcement with title: {}", requestDto.getTitle());

		validateCrossFieldRules(requestDto.getCtaLabel(), requestDto.getCtaLink(),
				requestDto.getFrequencyType(), requestDto.getCustomFrequencyDays());
		sanitizeAnnouncementRequest(requestDto);

		FeatureAnnouncement saved = featureAnnouncementDao.save(buildAnnouncementEntity(requestDto));
		List<FeatureAnnouncementRecipient> recipients = requestDto.getRecipientRoles().stream()
				.distinct()
				.map(role -> {
					FeatureAnnouncementRecipient recipient = new FeatureAnnouncementRecipient();
					recipient.setRecipientRole(role);
					recipient.setFeatureAnnouncement(saved);
					return recipient;
				})
				.toList();
		featureAnnouncementRecipientDao.saveAll(recipients);
		return new ResponseEntityDto(false, buildAnnouncementResponseDto(saved));
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getAnnouncements(AnnouncementListRequestFilterDto filterDto) {
		log.debug("Fetching announcements page={} size={}", filterDto.getPageNumber(), filterDto.getPageSize());

		Sort sort = Sort.by(filterDto.getSortDirection(), filterDto.getSortBy());
		Pageable pageable = PageRequest.of(filterDto.getPageNumber(), filterDto.getPageSize(), sort);
		Page<FeatureAnnouncement> page = featureAnnouncementDao.findAll(pageable);

		List<FeatureAnnouncementResponseDto> items = page.getContent().stream()
				.map(this::buildAnnouncementResponseDto)
				.toList();

		AnnouncementPageResponseDto pageDto = new AnnouncementPageResponseDto();
		pageDto.setItems(items);
		pageDto.setCurrentPage(page.getNumber());
		pageDto.setTotalItems(page.getTotalElements());
		pageDto.setTotalPages(page.getTotalPages());

		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getAnnouncementById(Long announcementId) {
		FeatureAnnouncement entity = featureAnnouncementDao.findById(announcementId)
				.orElseThrow(() -> new ModuleException(
						EPCommonMessageConstant.EP_COMMON_ERROR_ANNOUNCEMENT_NOT_FOUND));
		return new ResponseEntityDto(false, buildAnnouncementResponseDto(entity));
	}

	@Override
	@Transactional
	public ResponseEntityDto updateAnnouncement(Long announcementId,
			FeatureAnnouncementCreateRequestDto requestDto) {
		FeatureAnnouncement entity = featureAnnouncementDao.findById(announcementId)
				.orElseThrow(() -> new ModuleException(
						EPCommonMessageConstant.EP_COMMON_ERROR_ANNOUNCEMENT_NOT_FOUND));

		validateCrossFieldRules(requestDto.getCtaLabel(), requestDto.getCtaLink(),
				requestDto.getFrequencyType(), requestDto.getCustomFrequencyDays());
		sanitizeAnnouncementRequest(requestDto);

		populateAnnouncementEntityFromRequest(requestDto, entity);
		FeatureAnnouncement saved = featureAnnouncementDao.save(entity);

		featureAnnouncementRecipientDao.deleteByFeatureAnnouncementAnnouncementId(saved.getAnnouncementId());
		List<FeatureAnnouncementRecipient> newRecipients = requestDto.getRecipientRoles().stream()
				.distinct()
				.map(role -> {
					FeatureAnnouncementRecipient recipient = new FeatureAnnouncementRecipient();
					recipient.setRecipientRole(role);
					recipient.setFeatureAnnouncement(saved);
					return recipient;
				})
				.toList();
		featureAnnouncementRecipientDao.saveAll(newRecipients);
		return new ResponseEntityDto(false, buildAnnouncementResponseDto(saved));
	}

	@Override
	@Transactional
	public ResponseEntityDto updateAnnouncementStatus(Long announcementId,
			AnnouncementStatusUpdateRequestDto requestDto) {

		FeatureAnnouncement entity = featureAnnouncementDao.findById(announcementId)
				.orElseThrow(() -> new ModuleException(
						EPCommonMessageConstant.EP_COMMON_ERROR_ANNOUNCEMENT_NOT_FOUND));

		entity.setStatus(requestDto.getStatus());
		FeatureAnnouncement saved = featureAnnouncementDao.save(entity);
		return new ResponseEntityDto(false, buildAnnouncementResponseDto(saved));
	}

	private void sanitizeAnnouncementRequest(FeatureAnnouncementCreateRequestDto createRequest) {
		createRequest.setTitle(createRequest.getTitle().trim());
		createRequest.setCtaLabel(StringUtils.hasText(createRequest.getCtaLabel()) ? createRequest.getCtaLabel().trim() : null);
		createRequest.setCtaLink(StringUtils.hasText(createRequest.getCtaLink()) ? createRequest.getCtaLink().trim() : null);
		if (createRequest.getStatus() == null) {
			createRequest.setStatus(AnnouncementStatus.ACTIVE);
		}
		if (!AnnouncementFrequencyType.CUSTOM.equals(createRequest.getFrequencyType())) {
			createRequest.setCustomFrequencyDays(null);
		}
	}

	private void validateCrossFieldRules(String ctaLabel, String ctaLink,
			AnnouncementFrequencyType frequencyType, Integer customFrequencyDays) {
		if (StringUtils.hasText(ctaLabel) && !StringUtils.hasText(ctaLink)) {
			throw new ModuleException(
					EPCommonMessageConstant.EP_COMMON_ERROR_ANNOUNCEMENT_CTA_LINK_REQUIRED_WHEN_LABEL_SET);
		}
		if (AnnouncementFrequencyType.CUSTOM.equals(frequencyType)
				&& (customFrequencyDays == null || customFrequencyDays < 1)) {
			throw new ModuleException(
					EPCommonMessageConstant.EP_COMMON_ERROR_ANNOUNCEMENT_CUSTOM_FREQUENCY_DAYS_REQUIRED);
		}
	}

	private FeatureAnnouncementResponseDto buildAnnouncementResponseDto(FeatureAnnouncement announcement) {
		FeatureAnnouncementResponseDto response = new FeatureAnnouncementResponseDto();
		response.setAnnouncementId(announcement.getAnnouncementId());
		response.setTitle(announcement.getTitle());
		response.setDescription(announcement.getDescription());
		response.setCtaLabel(announcement.getCtaLabel());
		response.setCtaLink(announcement.getCtaLink());
		response.setTargetPage(announcement.getTargetPage());
		response.setTriggerType(announcement.getTriggerType());
		response.setFrequencyType(announcement.getFrequencyType());
		response.setCustomFrequencyDays(announcement.getCustomFrequencyDays());
		response.setStatus(announcement.getStatus());
		response.setImagePath(announcement.getImagePath());
		response.setCreatedDate(announcement.getCreatedDate() == null ? null
				: announcement.getCreatedDate().toInstant(ZoneOffset.UTC));
		List<Role> recipientRoles = featureAnnouncementRecipientDao
				.findByFeatureAnnouncementAnnouncementId(announcement.getAnnouncementId())
				.stream()
				.map(FeatureAnnouncementRecipient::getRecipientRole)
				.toList();
		response.setRecipientRoles(recipientRoles);
		return response;
	}

	private FeatureAnnouncement buildAnnouncementEntity(FeatureAnnouncementCreateRequestDto createRequest) {
		FeatureAnnouncement announcement = new FeatureAnnouncement();
		announcement.setTitle(createRequest.getTitle());
		announcement.setDescription(createRequest.getDescription());
		announcement.setCtaLabel(createRequest.getCtaLabel());
		announcement.setCtaLink(createRequest.getCtaLink());
		announcement.setTargetPage(createRequest.getTargetPage());
		announcement.setTriggerType(createRequest.getTriggerType());
		announcement.setFrequencyType(createRequest.getFrequencyType());
		announcement.setCustomFrequencyDays(createRequest.getCustomFrequencyDays());
		announcement.setStatus(createRequest.getStatus());
		announcement.setImagePath(createRequest.getImagePath());
		return announcement;
	}

	private void populateAnnouncementEntityFromRequest(FeatureAnnouncementCreateRequestDto createRequest,
			FeatureAnnouncement announcementEntity) {
		announcementEntity.setTitle(createRequest.getTitle());
		announcementEntity.setDescription(createRequest.getDescription());
		announcementEntity.setCtaLabel(createRequest.getCtaLabel());
		announcementEntity.setCtaLink(createRequest.getCtaLink());
		announcementEntity.setTargetPage(createRequest.getTargetPage());
		announcementEntity.setTriggerType(createRequest.getTriggerType());
		announcementEntity.setFrequencyType(createRequest.getFrequencyType());
		announcementEntity.setCustomFrequencyDays(createRequest.getCustomFrequencyDays());
		announcementEntity.setStatus(createRequest.getStatus());
		announcementEntity.setImagePath(createRequest.getImagePath());
	}

}
