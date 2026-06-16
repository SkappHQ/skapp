package com.skapp.community.peopleplanner.service;

import com.google.api.services.directory.Directory;

public interface ExternalPersonalSyncService {
    void authenticate() throws Exception;
    void bulkSync(String callerEmail);

}
