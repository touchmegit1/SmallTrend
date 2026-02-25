package com.smalltrend.dto.inventory;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor


public class PurchaseOrderResponse {
    private Integer id;
    private String po_number;
    private Integer supplier_id;
    private String supplier_name;
    private Integer location_id;
    private Integer creator_id;
    private String status;
    private Double subtotal;
    

}
