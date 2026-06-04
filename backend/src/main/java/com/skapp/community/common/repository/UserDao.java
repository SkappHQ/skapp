package com.skapp.community.common.repository;

import com.skapp.community.common.model.User;
import com.skapp.community.common.model.WorkLocation;
import com.skapp.community.common.type.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface UserDao extends JpaRepository<User, Long>, UserRepository {

	Optional<User> findByEmail(@NotNull @Email String email);

	Long countByIsActive(boolean isActive);

}
