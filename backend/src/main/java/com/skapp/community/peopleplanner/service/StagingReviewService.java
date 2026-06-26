package com.skapp.community.peopleplanner.service;

import com.skapp.community.peopleplanner.model.GoogleWorkspaceSyncStaging;

import java.util.List;

public interface StagingReviewService {

    List<GoogleWorkspaceSyncStaging> getPendingRecords();

    void approve(List<Long> ids);

    void reject(List<Long> ids);

}
