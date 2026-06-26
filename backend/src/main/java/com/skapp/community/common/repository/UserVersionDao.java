package com.skapp.community.common.repository;

import com.skapp.community.common.model.UserVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserVersionDao extends JpaRepository<UserVersion, Long> {

	UserVersion findByUserId(Long userId);

}
