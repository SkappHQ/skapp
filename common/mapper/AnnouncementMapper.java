package com.skapp.enterprise.common.mapper;

import com.skapp.enterprise.common.model.master.FeatureAnnouncement;
import com.skapp.enterprise.common.payload.request.FeatureAnnouncementCreateRequestDto;
import com.skapp.enterprise.common.payload.request.FeatureAnnouncementUpdateRequestDto;
import com.skapp.enterprise.common.payload.response.FeatureAnnouncementResponseDto;
import com.skapp.enterprise.common.type.AnnouncementFrequencyType;
import com.skapp.enterprise.common.type.AnnouncementStatus;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.springframework.util.StringUtils;

@Mapper(componentModel = "spring", imports = { StringUtils.class, AnnouncementStatus.class,
		AnnouncementFrequencyType.class })
public interface AnnouncementMapper {

	@Mapping(target = "recipientRoles",
			expression = "java(announcement.getRecipients().stream().map(r -> r.getRecipientRole()).toList())")
	FeatureAnnouncementResponseDto featureAnnouncementToResponseDto(FeatureAnnouncement announcement);

	@Mapping(target = "announcementId", ignore = true)
	@Mapping(target = "createdDate", ignore = true)
	@Mapping(target = "recipients", ignore = true)
	@Mapping(target = "title", expression = "java(dto.getTitle().trim())")
	@Mapping(target = "ctaLabel",
			expression = "java(StringUtils.hasText(dto.getCtaLabel()) ? dto.getCtaLabel().trim() : null)")
	@Mapping(target = "ctaLink",
			expression = "java(StringUtils.hasText(dto.getCtaLink()) ? dto.getCtaLink().trim() : null)")
	@Mapping(target = "status",
			expression = "java(dto.getStatus() != null ? dto.getStatus() : AnnouncementStatus.ACTIVE)")
	@Mapping(target = "customFrequencyDays",
			expression = "java(AnnouncementFrequencyType.CUSTOM.equals(dto.getFrequencyType()) ? dto.getCustomFrequencyDays() : null)")
	FeatureAnnouncement createRequestDtoToFeatureAnnouncement(FeatureAnnouncementCreateRequestDto dto);

	@Mapping(target = "announcementId", ignore = true)
	@Mapping(target = "createdDate", ignore = true)
	@Mapping(target = "recipients", ignore = true)
	@Mapping(target = "title", expression = "java(dto.getTitle().trim())")
	@Mapping(target = "ctaLabel",
			expression = "java(StringUtils.hasText(dto.getCtaLabel()) ? dto.getCtaLabel().trim() : null)")
	@Mapping(target = "ctaLink",
			expression = "java(StringUtils.hasText(dto.getCtaLink()) ? dto.getCtaLink().trim() : null)")
	@Mapping(target = "customFrequencyDays",
			expression = "java(AnnouncementFrequencyType.CUSTOM.equals(dto.getFrequencyType()) ? dto.getCustomFrequencyDays() : null)")
	void updateFeatureAnnouncementFromDto(FeatureAnnouncementUpdateRequestDto dto,
			@MappingTarget FeatureAnnouncement entity);

}
