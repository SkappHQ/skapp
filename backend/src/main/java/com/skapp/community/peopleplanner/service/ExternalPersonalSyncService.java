package com.skapp.community.peopleplanner.service;

import com.google.api.services.directory.Directory;

public interface ExternalPersonalSyncService {
    Directory authenticate();
    void bulkSync(String callerEmail);

}
