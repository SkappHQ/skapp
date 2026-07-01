package com.skapp.community.peopleplanner.service;

import com.skapp.community.peopleplanner.model.ExternalSyncStaging;

import java.util.List;
import java.util.Map;


public interface StagingReviewService {

    List<ExternalSyncStaging> getPendingRecords();

    void approve(List<Long> ids);
    void reject(List<Long> ids);
    Map<String, Object> getLastSyncChanges();

}
