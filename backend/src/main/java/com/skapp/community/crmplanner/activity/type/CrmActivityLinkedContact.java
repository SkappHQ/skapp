package com.skapp.community.crmplanner.activity.type;

public record CrmActivityLinkedContact(Long activityId, Long contactId, String contactName, Boolean contactDeleted) {

}
