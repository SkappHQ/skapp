package com.skapp.enterprise.invoice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Getter
@Setter
@NoArgsConstructor
@Data
@Table(name = "in_expense_attachment")
public class ExpenseAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "expense_id", nullable = false)
    private Long expenseId;

    @Column(name = "attachment_url", nullable = false, columnDefinition = "TEXT")
    private String attachmentUrl;

    @ManyToOne(optional = false)
    @JoinColumn(name = "expense_id", insertable = false, updatable = false)
    private InvoiceExpense expense;
}