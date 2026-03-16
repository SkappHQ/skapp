package com.skapp.enterprise.common.service;

import com.skapp.enterprise.common.payload.request.AnnouncementListRequestFilterDto;
import com.skapp.enterprise.common.payload.request.AnnouncementStatusUpdateRequestDto;
import com.skapp.enterprise.common.payload.request.FeatureAnnouncementCreateRequestDto;
import com.skapp.enterprise.common.payload.request.FeatureAnnouncementUpdateRequestDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;

public interface FeatureAnnouncementService {

	ResponseEntityDto createAnnouncement(FeatureAnnouncementCreateRequestDto requestDto);

	ResponseEntityDto getAnnouncements(AnnouncementListRequestFilterDto filterDto);

	ResponseEntityDto getAnnouncementById(Long announcementId);

	ResponseEntityDto updateAnnouncement(Long announcementId, FeatureAnnouncementUpdateRequestDto requestDto);

	ResponseEntityDto updateAnnouncementStatus(Long announcementId, AnnouncementStatusUpdateRequestDto requestDto);

}
