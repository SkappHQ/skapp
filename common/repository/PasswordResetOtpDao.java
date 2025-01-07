package com.skapp.enterprise.common.repository;

import com.skapp.enterprise.common.model.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PasswordResetOtpDao extends JpaRepository<PasswordResetOtp, Long> {

}
