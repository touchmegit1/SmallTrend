package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Chi tiết sản phẩm trong combo
 */
@Entity
@Table(name = "product_combo_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductComboItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "combo_id", nullable = false)
    private ProductCombo combo;

    @ManyToOne
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    @Column(nullable = false)
    private Integer quantity; // Số lượng sản phẩm trong combo

    @Column
    private Integer minQuantity; // Tối thiểu phải chọn (cho mix-and-match)

    @Column
    private Integer maxQuantity; // Tối đa được chọn

    @Column
    private Boolean isOptional; // Có thể bỏ qua sản phẩm này không

    @Column
    private Boolean canSubstitute; // Có thể thay thế bằng sản phẩm khác

    @Column
    private Integer displayOrder; // Thứ tự hiển thị

    @Column(length = 500)
    private String notes;
}
