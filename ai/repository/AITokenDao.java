package com.skapp.enterprise.ai.repository;

import com.skapp.community.common.model.User;
import com.skapp.enterprise.ai.model.AIToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AITokenDao extends JpaRepository<AIToken, Long> {

	Optional<AIToken> findByUser(User user);

	Optional<AIToken> findByUser_UserId(Long userId);

}
