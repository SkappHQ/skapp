package com.skapp.community.common.repository;

import com.skapp.community.common.model.User;
import com.skapp.community.common.type.LoginMethod;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDao extends JpaRepository<User, Long> {

	Optional<User> findByEmail(@NotNull @Email String email);

	Long countByIsActive(boolean isActive);

	List<User> findAllByIsActiveTrue();

	List<User> findAllByLoginMethodAndIsActiveTrue(LoginMethod loginMethod);

}
