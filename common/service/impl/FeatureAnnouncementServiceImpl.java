package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.mapper.AnnouncementMapper;
import com.skapp.enterprise.common.model.FeatureAnnouncementRecipient;
import com.skapp.enterprise.common.model.master.FeatureAnnouncement;
import com.skapp.enterprise.common.payload.request.AnnouncementListRequestFilterDto;
import com.skapp.enterprise.common.payload.request.AnnouncementStatusUpdateRequestDto;
import com.skapp.enterprise.common.payload.request.FeatureAnnouncementCreateRequestDto;
import com.skapp.enterprise.common.payload.request.FeatureAnnouncementUpdateRequestDto;
import com.skapp.enterprise.common.payload.response.AnnouncementPageResponseDto;
import com.skapp.enterprise.common.payload.response.FeatureAnnouncementResponseDto;
import com.skapp.enterprise.common.repository.FeatureAnnouncementDao;
import com.skapp.enterprise.common.service.FeatureAnnouncementService;
import com.skapp.enterprise.common.type.AnnouncementFrequencyType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class FeatureAnnouncementServiceImpl implements FeatureAnnouncementService {

	private final FeatureAnnouncementDao featureAnnouncementDao;

	private final AnnouncementMapper announcementMapper;

	@Override
	@Transactional
	public ResponseEntityDto createAnnouncement(FeatureAnnouncementCreateRequestDto requestDto) {
		log.debug("Creating feature announcement with title: {}", requestDto.getTitle());

		validateCrossFieldRules(requestDto.getCtaLabel(), requestDto.getCtaLink(),
				requestDto.getFrequencyType(), requestDto.getCustomFrequencyDays());

		FeatureAnnouncement announcement = announcementMapper.createRequestDtoToFeatureAnnouncement(requestDto);
		List<FeatureAnnouncementRecipient> recipients = requestDto.getRecipientRoles().stream()
				.distinct()
				.map(role -> {
					FeatureAnnouncementRecipient recipient = new FeatureAnnouncementRecipient();
					recipient.setRecipientRole(role);
					recipient.setFeatureAnnouncement(announcement);
					return recipient;
				})
				.toList();
		announcement.getRecipients().addAll(recipients);

		FeatureAnnouncement saved = featureAnnouncementDao.save(announcement);
		return new ResponseEntityDto(false, announcementMapper.featureAnnouncementToResponseDto(saved));
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getAnnouncements(AnnouncementListRequestFilterDto filterDto) {
		log.debug("Fetching announcements page={} size={}", filterDto.getPageNumber(), filterDto.getPageSize());

		Sort sort = "ASC".equalsIgnoreCase(filterDto.getSortDirection())
				? Sort.by(filterDto.getSortBy()).ascending()
				: Sort.by(filterDto.getSortBy()).descending();

		Pageable pageable = PageRequest.of(filterDto.getPageNumber(), filterDto.getPageSize(), sort);
		Page<FeatureAnnouncement> page = featureAnnouncementDao.findAll(pageable);

		List<FeatureAnnouncementResponseDto> items = page.getContent().stream()
				.map(announcementMapper::featureAnnouncementToResponseDto)
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
	public ResponseEntityDto getAnnouncementById(String announcementId) {
		log.debug("Fetching announcement by id: {}", announcementId);
		FeatureAnnouncement entity = featureAnnouncementDao.findById(announcementId)
				.orElseThrow(() -> new ModuleException(
						EPCommonMessageConstant.EP_COMMON_ERROR_ANNOUNCEMENT_NOT_FOUND));
		return new ResponseEntityDto(false, announcementMapper.featureAnnouncementToResponseDto(entity));
	}

	@Override
	@Transactional
	public ResponseEntityDto updateAnnouncement(String announcementId,
			FeatureAnnouncementUpdateRequestDto requestDto) {
		log.debug("Updating announcement id: {}", announcementId);

		FeatureAnnouncement entity = featureAnnouncementDao.findById(announcementId)
				.orElseThrow(() -> new ModuleException(
						EPCommonMessageConstant.EP_COMMON_ERROR_ANNOUNCEMENT_NOT_FOUND));

		validateCrossFieldRules(requestDto.getCtaLabel(), requestDto.getCtaLink(),
				requestDto.getFrequencyType(), requestDto.getCustomFrequencyDays());

		announcementMapper.updateFeatureAnnouncementFromDto(requestDto, entity);

		entity.getRecipients().clear();
		List<FeatureAnnouncementRecipient> newRecipients = requestDto.getRecipientRoles().stream()
				.distinct()
				.map(role -> {
					FeatureAnnouncementRecipient recipient = new FeatureAnnouncementRecipient();
					recipient.setRecipientRole(role);
					recipient.setFeatureAnnouncement(entity);
					return recipient;
				})
				.toList();
		entity.getRecipients().addAll(newRecipients);

		FeatureAnnouncement saved = featureAnnouncementDao.save(entity);
		return new ResponseEntityDto(false, announcementMapper.featureAnnouncementToResponseDto(saved));
	}

	@Override
	@Transactional
	public ResponseEntityDto updateAnnouncementStatus(String announcementId,
			AnnouncementStatusUpdateRequestDto requestDto) {
		log.debug("Updating status for announcement id: {} to {}", announcementId, requestDto.getStatus());

		FeatureAnnouncement entity = featureAnnouncementDao.findById(announcementId)
				.orElseThrow(() -> new ModuleException(
						EPCommonMessageConstant.EP_COMMON_ERROR_ANNOUNCEMENT_NOT_FOUND));

		entity.setStatus(requestDto.getStatus());
		FeatureAnnouncement saved = featureAnnouncementDao.save(entity);
		return new ResponseEntityDto(false, announcementMapper.featureAnnouncementToResponseDto(saved));
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

}
