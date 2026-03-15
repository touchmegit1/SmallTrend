package com.smalltrend.controller.products;

import com.smalltrend.dto.inventory.dashboard.PriceExpiryAlertResponse;
import com.smalltrend.dto.products.CreateProductRequest;
import com.smalltrend.dto.products.CreateVariantRequest;
import com.smalltrend.dto.products.ProductResponse;
import com.smalltrend.dto.products.UnitConversionRequest;
import com.smalltrend.dto.products.UnitConversionResponse;
import com.smalltrend.dto.products.UnitRequest;
import com.smalltrend.dto.products.UnitResponse;
import com.smalltrend.dto.products.VariantPriceRequest;
import com.smalltrend.dto.products.VariantPriceResponse;
import com.smalltrend.dto.pos.ProductVariantRespone;
import com.smalltrend.service.products.PriceExpiryAlertEmailScheduler;
import com.smalltrend.service.products.ProductService;
import com.smalltrend.service.products.ProductVariantService;
import com.smalltrend.service.UnitConversionService;
import com.smalltrend.service.UnitService;
import com.smalltrend.service.VariantPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller xử lý các HTTP request liên quan đến Product (Sản phẩm) Cung cấp
 * các RESTful API cho sản phẩm và các biến thể (variants) của nó
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"})
public class ProductController {

    private final ProductService productService;
    private final ProductVariantService productVariantService;
    private final UnitConversionService unitConversionService;
    private final UnitService unitService;
    private final VariantPriceService variantPriceService;
    private final PriceExpiryAlertEmailScheduler priceExpiryAlertEmailScheduler;

    // Lấy danh sách tất cả sản phẩm
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAll() {
        return ResponseEntity.ok(productService.getAll());
    }

    // Lấy thông tin chi tiết một sản phẩm theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    // Lấy danh sách các biến thể (variants) của một sản phẩm
    @GetMapping("/{id}/variants")
    public ResponseEntity<List<ProductVariantRespone>> getVariantsByProductId(@PathVariable Integer id) {
        return ResponseEntity.ok(productVariantService.getVariantsByProductId(id));
    }

    // Lấy danh sách tất cả các biến thể
    @GetMapping("/variants")
    public ResponseEntity<List<ProductVariantRespone>> getAllVariants(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String barcode) {
        return ResponseEntity.ok(productVariantService.getAllProductVariants(search, barcode));
    }

    // Tạo mới một biến thể cho sản phẩm
    @PostMapping("/{id}/variants")
    public ResponseEntity<ProductVariantRespone> createVariant(
            @PathVariable Integer id,
            @RequestBody CreateVariantRequest request) {
        return ResponseEntity.ok(productVariantService.createVariant(id, request));
    }

    // Cập nhật thông tin của một biến thể
    @PutMapping("/variants/{variantId}")
    public ResponseEntity<ProductVariantRespone> updateVariant(
            @PathVariable Integer variantId,
            @RequestBody CreateVariantRequest request) {
        return ResponseEntity.ok(productVariantService.updateVariant(variantId, request));
    }

    // Bật/Tắt trạng thái hoạt động (active/inactive) của một biến thể
    @PutMapping("/variants/{variantId}/toggle-status")
    public ResponseEntity<String> toggleVariantStatus(@PathVariable Integer variantId) {
        productVariantService.toggleVariantStatus(variantId);
        return ResponseEntity.ok("Variant status toggled");
    }

    // Xóa một biến thể (chỉ trong 2 phút đầu sau khi tạo)
    @DeleteMapping("/variants/{variantId}")
    public ResponseEntity<String> deleteVariant(@PathVariable Integer variantId) {
        productVariantService.deleteVariant(variantId);
        return ResponseEntity.ok("Variant deleted");
    }

    // Tự động tạo mã SKU dựa trên thông tin sản phẩm
    @GetMapping("/{id}/generate-sku")
    public ResponseEntity<java.util.Map<String, String>> generateSku(
            @PathVariable Integer id,
            @RequestParam(required = false) Integer unitId) {
        String sku = productVariantService.generateSku(id, unitId);
        return ResponseEntity.ok(java.util.Map.of("sku", sku));
    }

    // Tự động tạo mã Barcode nội bộ (dành cho sản phẩm đóng gói tại cửa hàng)
    @GetMapping("/{id}/generate-barcode")
    public ResponseEntity<java.util.Map<String, String>> generateBarcode(@PathVariable Integer id) {
        String barcode = productVariantService.generateInternalBarcode(id);
        return ResponseEntity.ok(java.util.Map.of("barcode", barcode));
    }

    // Lấy danh sách quy đổi đơn vị của biến thể
    @GetMapping("/variants/{variantId}/conversions")
    public ResponseEntity<List<UnitConversionResponse>> getConversionsByVariantId(@PathVariable Integer variantId) {
        return ResponseEntity.ok(unitConversionService.getConversionsByVariantId(variantId));
    }

    // Thêm quy đổi đơn vị mới
    @PostMapping("/variants/{variantId}/conversions")
    public ResponseEntity<UnitConversionResponse> addConversion(
            @PathVariable Integer variantId,
            @RequestBody UnitConversionRequest request) {
        return ResponseEntity.ok(unitConversionService.addConversion(variantId, request));
    }

    // Cập nhật quy đổi đơn vị
    @PutMapping("/conversions/{conversionId}")
    public ResponseEntity<UnitConversionResponse> updateConversion(
            @PathVariable Integer conversionId,
            @RequestBody UnitConversionRequest request) {
        return ResponseEntity.ok(unitConversionService.updateConversion(conversionId, request));
    }

    // Xóa quy đổi đơn vị
    @DeleteMapping("/conversions/{conversionId}")
    public ResponseEntity<String> deleteConversion(@PathVariable Integer conversionId) {
        unitConversionService.deleteConversion(conversionId);
        return ResponseEntity.ok("Unit conversion deleted");
    }

    // Lấy danh sách tất cả các đơn vị tính có trong hệ thống
    @GetMapping("/units")
    public ResponseEntity<List<UnitResponse>> getAllUnits() {
        return ResponseEntity.ok(unitService.getAllUnits());
    }

    // Thêm đơn vị tính mới
    @PostMapping("/units")
    public ResponseEntity<UnitResponse> createUnit(@RequestBody UnitRequest request) {
        return ResponseEntity.ok(unitService.createUnit(request));
    }

    // Cập nhật đơn vị tính
    @PutMapping("/units/{id}")
    public ResponseEntity<UnitResponse> updateUnit(
            @PathVariable Integer id,
            @RequestBody UnitRequest request) {
        return ResponseEntity.ok(unitService.updateUnit(id, request));
    }

    // Xóa đơn vị tính
    @DeleteMapping("/units/{id}")
    public ResponseEntity<String> deleteUnit(@PathVariable Integer id) {
        unitService.deleteUnit(id);
        return ResponseEntity.ok("Unit deleted");
    }

    // ─── Variant Prices ──────────────────────────────────────────────────────
    // Tạo giá mới cho variant (giá cũ chuyển INACTIVE)
    @PostMapping("/variants/{variantId}/prices")
    public ResponseEntity<VariantPriceResponse> createVariantPrice(
            @PathVariable Integer variantId,
            @RequestBody VariantPriceRequest request) {
        return ResponseEntity.ok(variantPriceService.createPrice(variantId, request));
    }

    // Lấy lịch sử giá của variant
    @GetMapping("/variants/{variantId}/prices")
    public ResponseEntity<List<VariantPriceResponse>> getVariantPriceHistory(@PathVariable Integer variantId) {
        return ResponseEntity.ok(variantPriceService.getPriceHistory(variantId));
    }

    // Lấy giá ACTIVE hiện tại của variant
    @GetMapping("/variants/{variantId}/prices/active")
    public ResponseEntity<VariantPriceResponse> getActiveVariantPrice(@PathVariable Integer variantId) {
        VariantPriceResponse price = variantPriceService.getActivePrice(variantId);
        if (price == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(price);
    }

    // Cập nhật ngày hiệu lực cho giá ACTIVE hiện tại
    @PutMapping("/variants/{variantId}/prices/active/date")
    public ResponseEntity<VariantPriceResponse> updateActivePriceDate(
            @PathVariable Integer variantId,
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
    public ResponseEntity<VariantPriceResponse> updateActivePriceExpiry(
            @PathVariable Integer variantId,
            @RequestBody java.util.Map<String, String> request) {
        String dateStr = request.get("expiryDate");
        java.time.LocalDate newDate = (dateStr != null && !dateStr.isBlank())
                ? java.time.LocalDate.parse(dateStr.split("T")[0])
                : null;
        return ResponseEntity.ok(variantPriceService.updateActivePriceExpiry(variantId, newDate));
    }

    // Toggle trạng thái active/inactive của một bản ghi giá
    @PutMapping("/prices/{priceId}/toggle-status")
    public ResponseEntity<VariantPriceResponse> togglePriceStatus(@PathVariable Integer priceId) {
        return ResponseEntity.ok(variantPriceService.togglePriceStatus(priceId));
    }

    // Lấy danh sách giá sắp hết hiệu lực theo số ngày cảnh báo
    @GetMapping("/price-expiry-alerts")
    public ResponseEntity<List<PriceExpiryAlertResponse>> getPriceExpiryAlerts(
            @RequestParam(defaultValue = "1") int days) {
        return ResponseEntity.ok(variantPriceService.getPriceExpiryAlerts(days));
    }

    // Trigger gửi email cảnh báo ngay lập tức để test
    @PostMapping("/price-expiry-alerts/send-now")
    public ResponseEntity<java.util.Map<String, Object>> sendPriceExpiryAlertsNow() {
        int sentCount = priceExpiryAlertEmailScheduler.sendPriceExpiryAlertsNow();
        return ResponseEntity.ok(java.util.Map.of(
                "message", "Price expiry alert email job executed",
                "sentCount", sentCount,
                "recipients", priceExpiryAlertEmailScheduler.getRecipientEmails(),
                "recipientCount", priceExpiryAlertEmailScheduler.getRecipientCount(),
                "sender", priceExpiryAlertEmailScheduler.getSenderEmail(),
                "daysBeforeExpiry", priceExpiryAlertEmailScheduler.getDaysBeforeExpiry()
        ));
    }

    @PostMapping
    public ResponseEntity<ProductResponse> create(@RequestBody CreateProductRequest request) {
        return ResponseEntity.ok(productService.create(request));
    }

    // Cập nhật thông tin của một sản phẩm hiện có
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(@PathVariable Integer id, @RequestBody CreateProductRequest request) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    // Bật/Tắt trạng thái hoạt động của một sản phẩm
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<String> toggleStatus(@PathVariable Integer id) {
        productService.toggleStatus(id);
        return ResponseEntity.ok("Product status toggled");
    }

    // Xóa một sản phẩm theo ID
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        productService.delete(id);
        return ResponseEntity.ok("Product deleted");
    }
}
