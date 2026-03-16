package com.skapp.enterprise.common.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.type.AnnouncementInteractionType;
import com.skapp.enterprise.common.type.AnnouncementTriggerType;

public interface AnnouncementService {

	ResponseEntityDto getEligibleAnnouncements(AnnouncementTriggerType trigger, String targetPage);

	ResponseEntityDto recordInteraction(Long announcementId, AnnouncementInteractionType type);

}
