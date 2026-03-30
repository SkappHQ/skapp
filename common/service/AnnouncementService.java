package com.skapp.enterprise.common.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.type.AnnouncementInteractionType;

public interface AnnouncementService {

	ResponseEntityDto getEligibleAnnouncements();

	ResponseEntityDto recordInteraction(Long announcementId, AnnouncementInteractionType type);

}
