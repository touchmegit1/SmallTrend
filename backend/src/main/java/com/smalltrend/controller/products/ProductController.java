package com.smalltrend.controller.products;

import com.smalltrend.dto.inventory.dashboard.PriceExpiryAlertResponse;
import com.smalltrend.dto.products.CreateProductRequest;
import com.smalltrend.dto.products.CreateVariantRequest;
import com.smalltrend.dto.products.ProductResponse;
import com.smalltrend.dto.products.ProductVariantRespone;
import com.smalltrend.dto.products.UnitConversionRequest;
import com.smalltrend.dto.products.UnitConversionResponse;
import com.smalltrend.dto.products.UnitRequest;
import com.smalltrend.dto.products.UnitResponse;
import com.smalltrend.dto.products.VariantPriceRequest;
import com.smalltrend.dto.products.VariantPriceResponse;
import com.smalltrend.service.products.PriceExpiryAlertEmailScheduler;
import com.smalltrend.service.products.ProductService;
import com.smalltrend.service.products.ProductVariantService;
import com.smalltrend.service.products.UnitConversionService;
import com.smalltrend.service.products.UnitService;
import com.smalltrend.service.products.VariantPriceService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller xử lý các HTTP request liên quan đến Product (Sản phẩm) Cung cấp
 * các RESTful API cho sản phẩm và các biến thể (variants) của nó
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    // REVIEW FLOW: Controller nhận request -> phân quyền @PreAuthorize -> chuyển cho service xử lý nghiệp vụ -> trả response cho frontend.
    private final ProductService productService;
    private final ProductVariantService productVariantService;
    private final UnitConversionService unitConversionService;
    private final UnitService unitService;
    private final VariantPriceService variantPriceService;
    private final PriceExpiryAlertEmailScheduler priceExpiryAlertEmailScheduler;

    // Lấy danh sách tất cả sản phẩm
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER','CASHIER','ROLE_CASHIER','INVENTORY_STAFF','ROLE_INVENTORY_STAFF','SALES_STAFF','ROLE_SALES_STAFF')")
    public ResponseEntity<List<ProductResponse>> getAll() {
        return ResponseEntity.ok(productService.getAll());
    }

    // Lấy thông tin chi tiết một sản phẩm theo ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER','CASHIER','ROLE_CASHIER','INVENTORY_STAFF','ROLE_INVENTORY_STAFF','SALES_STAFF','ROLE_SALES_STAFF')")
    public ResponseEntity<ProductResponse> getById(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    // Lấy danh sách các biến thể (variants) của một sản phẩm
    @GetMapping("/{id}/variants")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER','CASHIER','ROLE_CASHIER','INVENTORY_STAFF','ROLE_INVENTORY_STAFF','SALES_STAFF','ROLE_SALES_STAFF')")
    public ResponseEntity<List<ProductVariantRespone>> getVariantsByProductId(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(productVariantService.getVariantsByProductId(id));
    }

    // Lấy danh sách tất cả các biến thể
    @GetMapping("/variants")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER','CASHIER','ROLE_CASHIER','INVENTORY_STAFF','ROLE_INVENTORY_STAFF','SALES_STAFF','ROLE_SALES_STAFF')")
    public ResponseEntity<List<ProductVariantRespone>> getAllVariants(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "barcode", required = false) String barcode) {
        return ResponseEntity.ok(productVariantService.getAllProductVariants(search, barcode));
    }

    // Tạo mới một biến thể cho sản phẩm
    @PostMapping("/{id}/variants")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER')")
    public ResponseEntity<ProductVariantRespone> createVariant(
            @PathVariable("id") Integer id,
            @RequestBody CreateVariantRequest request) {
        return ResponseEntity.ok(productVariantService.createVariant(id, request));
    }

    // Cập nhật thông tin của một biến thể
    @PutMapping("/variants/{variantId}")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER')")
    public ResponseEntity<ProductVariantRespone> updateVariant(
            @PathVariable("variantId") Integer variantId,
            @RequestBody CreateVariantRequest request) {
        return ResponseEntity.ok(productVariantService.updateVariant(variantId, request));
    }

    // Bật/Tắt trạng thái hoạt động (active/inactive) của một biến thể
    @PutMapping("/variants/{variantId}/toggle-status")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER')")
    public ResponseEntity<String> toggleVariantStatus(@PathVariable("variantId") Integer variantId) {
        productVariantService.toggleVariantStatus(variantId);
        return ResponseEntity.ok("Đã thay đổi trạng thái biến thể");
    }

    // Xóa một biến thể (chỉ trong 2 phút đầu sau khi tạo)
    @DeleteMapping("/variants/{variantId}")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER')")
    public ResponseEntity<String> deleteVariant(@PathVariable("variantId") Integer variantId) {
        productVariantService.deleteVariant(variantId);
        return ResponseEntity.ok("Đã xóa biến thể");
    }

    // Tự động tạo mã SKU dựa trên thông tin sản phẩm
    @GetMapping("/{id}/generate-sku")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER')")
    public ResponseEntity<java.util.Map<String, String>> generateSku(
            @PathVariable("id") Integer id,
            @RequestParam(value = "unitId", required = false) Integer unitId) {
        String sku = productVariantService.generateSku(id, unitId);
        return ResponseEntity.ok(java.util.Map.of("sku", sku));
    }

    // Tự động tạo mã Barcode nội bộ (dành cho sản phẩm đóng gói tại cửa hàng)
    @GetMapping("/{id}/generate-barcode")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER')")
    public ResponseEntity<java.util.Map<String, String>> generateBarcode(@PathVariable("id") Integer id) {
        String barcode = productVariantService.generateInternalBarcode(id);
        return ResponseEntity.ok(java.util.Map.of("barcode", barcode));
    }

    // Lấy danh sách quy đổi đơn vị của biến thể
    @GetMapping("/variants/{variantId}/conversions")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER','CASHIER','ROLE_CASHIER','INVENTORY_STAFF','ROLE_INVENTORY_STAFF','SALES_STAFF','ROLE_SALES_STAFF')")
    public ResponseEntity<List<UnitConversionResponse>> getConversionsByVariantId(@PathVariable("variantId") Integer variantId) {
        return ResponseEntity.ok(unitConversionService.getConversionsByVariantId(variantId));
    }

    // Thêm quy đổi đơn vị mới
    @PostMapping("/variants/{variantId}/conversions")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER')")
    public ResponseEntity<UnitConversionResponse> addConversion(
            @PathVariable("variantId") Integer variantId,
            @RequestBody UnitConversionRequest request) {
        return ResponseEntity.ok(unitConversionService.addConversion(variantId, request));
    }

    // Cập nhật quy đổi đơn vị
    @PutMapping("/conversions/{conversionId}")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER')")
    public ResponseEntity<UnitConversionResponse> updateConversion(
            @PathVariable("conversionId") Integer conversionId,
            @RequestBody UnitConversionRequest request) {
        return ResponseEntity.ok(unitConversionService.updateConversion(conversionId, request));
    }

    // Xóa quy đổi đơn vị
    @DeleteMapping("/conversions/{conversionId}")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER')")
    public ResponseEntity<String> deleteConversion(@PathVariable("conversionId") Integer conversionId) {
        unitConversionService.deleteConversion(conversionId);
        return ResponseEntity.ok("Đã xóa quy đổi đơn vị");
    }

    // Lấy danh sách tất cả các đơn vị tính có trong hệ thống
    @GetMapping("/units")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER','CASHIER','ROLE_CASHIER','INVENTORY_STAFF','ROLE_INVENTORY_STAFF','SALES_STAFF','ROLE_SALES_STAFF')")
    public ResponseEntity<List<UnitResponse>> getAllUnits() {
        return ResponseEntity.ok(unitService.getAllUnits());
    }

    // Thêm đơn vị tính mới
    @PostMapping("/units")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER')")
    public ResponseEntity<UnitResponse> createUnit(@RequestBody UnitRequest request) {
        return ResponseEntity.ok(unitService.createUnit(request));
    }

    // Cập nhật đơn vị tính
    @PutMapping("/units/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER')")
    public ResponseEntity<UnitResponse> updateUnit(
            @PathVariable("id") Integer id,
            @RequestBody UnitRequest request) {
        return ResponseEntity.ok(unitService.updateUnit(id, request));
    }

    // Xóa đơn vị tính
    @DeleteMapping("/units/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER')")
    public ResponseEntity<String> deleteUnit(@PathVariable("id") Integer id) {
        unitService.deleteUnit(id);
        return ResponseEntity.ok("Đã xóa đơn vị tính");
    }

    // ─── Variant Prices ──────────────────────────────────────────────────────
    // REVIEW FLOW (PRICE): tạo/lấy/cập nhật giá theo variant -> service tự quản lý active/inactive + lịch sử hiệu lực giá.
    // Tạo giá mới cho variant (giá cũ chuyển INACTIVE)
    @PostMapping("/variants/{variantId}/prices")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER')")
    public ResponseEntity<VariantPriceResponse> createVariantPrice(
            @PathVariable("variantId") Integer variantId,
            @RequestBody VariantPriceRequest request) {
        return ResponseEntity.ok(variantPriceService.createPrice(variantId, request));
    }

    // Lấy lịch sử giá của variant
    @GetMapping("/variants/{variantId}/prices")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER','CASHIER','ROLE_CASHIER','INVENTORY_STAFF','ROLE_INVENTORY_STAFF','SALES_STAFF','ROLE_SALES_STAFF')")
    public ResponseEntity<List<VariantPriceResponse>> getVariantPriceHistory(@PathVariable("variantId") Integer variantId) {
        return ResponseEntity.ok(variantPriceService.getPriceHistory(variantId));
    }

    // Lấy giá ACTIVE hiện tại của variant
    @GetMapping("/variants/{variantId}/prices/active")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER','CASHIER','ROLE_CASHIER','INVENTORY_STAFF','ROLE_INVENTORY_STAFF','SALES_STAFF','ROLE_SALES_STAFF')")
    public ResponseEntity<VariantPriceResponse> getActiveVariantPrice(@PathVariable("variantId") Integer variantId) {
        VariantPriceResponse price = variantPriceService.getActivePrice(variantId);
        if (price == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(price);
    }

    // Cập nhật ngày hiệu lực cho giá ACTIVE hiện tại
    @PutMapping("/variants/{variantId}/prices/active/date")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER')")
    public ResponseEntity<VariantPriceResponse> updateActivePriceDate(
            @PathVariable("variantId") Integer variantId,
            @RequestBody java.util.Map<String, String> request) {
        String dateStr = request.get("effectiveDate");
        if (dateStr == null) {
            return ResponseEntity.badRequest().build();
        }
        java.time.LocalDate newDate = java.time.LocalDate.parse(dateStr.split("T")[0]); // Handle ISO string from JS
        return ResponseEntity.ok(variantPriceService.updateActivePriceDate(variantId, newDate));
    }

    // Cập nhật ngày hết hiệu lực cho giá ACTIVE hiện tại
    @PutMapping("/variants/{variantId}/prices/active/expiry")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER')")
    public ResponseEntity<VariantPriceResponse> updateActivePriceExpiry(
            @PathVariable("variantId") Integer variantId,
            @RequestBody java.util.Map<String, String> request) {
        String dateStr = request.get("expiryDate");
        java.time.LocalDate newDate = (dateStr != null && !dateStr.isBlank())
                ? java.time.LocalDate.parse(dateStr.split("T")[0])
                : null;
        return ResponseEntity.ok(variantPriceService.updateActivePriceExpiry(variantId, newDate));
    }

    // Cập nhật ngày hết hiệu lực cho một bản ghi giá theo priceId (cho phép null để bỏ hết hạn)
    @PutMapping("/prices/{priceId}/expiry")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER')")
    public ResponseEntity<VariantPriceResponse> updatePriceExpiry(
            @PathVariable("priceId") Integer priceId,
            @RequestBody java.util.Map<String, String> request) {
        String dateStr = request.get("expiryDate");
        java.time.LocalDate newDate = (dateStr != null && !dateStr.isBlank())
                ? java.time.LocalDate.parse(dateStr.split("T")[0])
                : null;
        return ResponseEntity.ok(variantPriceService.updatePriceExpiry(priceId, newDate));
    }

    // Toggle trạng thái active/inactive của một bản ghi giá
    @PutMapping("/prices/{priceId}/toggle-status")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER')")
    public ResponseEntity<VariantPriceResponse> togglePriceStatus(@PathVariable("priceId") Integer priceId) {
        return ResponseEntity.ok(variantPriceService.togglePriceStatus(priceId));
    }

    // Xóa một bản ghi giá (chỉ cho phép khi không ACTIVE)
    @DeleteMapping("/prices/{priceId}")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER')")
    public ResponseEntity<String> deletePrice(@PathVariable("priceId") Integer priceId) {
        variantPriceService.deletePrice(priceId);
        return ResponseEntity.ok("Đã xóa bản ghi giá");
    }

    // Lấy danh sách giá sắp hết hiệu lực theo số ngày cảnh báo
    @GetMapping("/price-expiry-alerts")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER','CASHIER','ROLE_CASHIER','INVENTORY_STAFF','ROLE_INVENTORY_STAFF','SALES_STAFF','ROLE_SALES_STAFF')")
    public ResponseEntity<List<PriceExpiryAlertResponse>> getPriceExpiryAlerts(
            @RequestParam(name = "days", defaultValue = "1") int days) {
        return ResponseEntity.ok(variantPriceService.getPriceExpiryAlerts(days));
    }

    // Trigger gửi email cảnh báo ngay lập tức để test
    @PostMapping("/price-expiry-alerts/send-now")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER')")
    public ResponseEntity<java.util.Map<String, Object>> sendPriceExpiryAlertsNow() {
        int sentCount = priceExpiryAlertEmailScheduler.sendPriceExpiryAlertsNow();
        return ResponseEntity.ok(java.util.Map.of(
                "message", "Đã chạy tác vụ gửi email cảnh báo giá sắp hết hạn",
                "sentCount", sentCount,
                "recipients", priceExpiryAlertEmailScheduler.getRecipientEmails(),
                "recipientCount", priceExpiryAlertEmailScheduler.getRecipientCount(),
                "sender", priceExpiryAlertEmailScheduler.getSenderEmail(),
                "daysBeforeExpiry", priceExpiryAlertEmailScheduler.getDaysBeforeExpiry()
        ));
    }

    // REVIEW FLOW (PRODUCT CRUD): tạo/cập nhật/toggle/xoá product sẽ gọi ProductService, nơi enforce rule validate + propagate trạng thái xuống variants.
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER')")
    public ResponseEntity<ProductResponse> create(@RequestBody CreateProductRequest request) {
        return ResponseEntity.ok(productService.create(request));
    }

    // Cập nhật thông tin của một sản phẩm hiện có
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER')")
    public ResponseEntity<ProductResponse> update(@PathVariable("id") Integer id, @RequestBody CreateProductRequest request) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    // Bật/Tắt trạng thái hoạt động của một sản phẩm
    @PutMapping("/{id}/toggle-status")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER')")
    public ResponseEntity<String> toggleStatus(@PathVariable("id") Integer id) {
        productService.toggleStatus(id);
        return ResponseEntity.ok("Đã thay đổi trạng thái sản phẩm");
    }

    // Xóa một sản phẩm theo ID
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER')")
    public ResponseEntity<String> delete(@PathVariable("id") Integer id) {
        productService.delete(id);
        return ResponseEntity.ok("Đã xóa sản phẩm");
    }
}

