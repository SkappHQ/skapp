package com.skapp.community.common.repository;

import java.util.List;
import java.util.Map;

public interface UserEmailLookupRepository {

	Map<String, Long> findUserIdsByEmailIgnoreCase(List<String> emails);

}
