package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.DocumentVersionField;
import com.skapp.enterprise.esignature.model.Field;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentVersionFieldRepository extends JpaRepository<DocumentVersionField, Long> {

	DocumentVersionField findByField(Field field);

	List<DocumentVersionField> findByField_IdIn(List<Long> fieldIdList);

}
