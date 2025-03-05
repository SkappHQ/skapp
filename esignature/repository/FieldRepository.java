package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.Field;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FieldRepository extends JpaRepository<Field, Long> {

	List<Field> findByIdIn(List<Long> fieldIds);

}
