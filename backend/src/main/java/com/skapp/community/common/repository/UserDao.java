package com.skapp.community.common.repository;

import com.skapp.community.common.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserDao extends JpaRepository<User, Long> {

	Optional<User> findByEmail(@NotNull @Email String email);

	List<User> findByEmailIn(Collection<String> emails);

	Long countByIsActive(boolean isActive);

}
