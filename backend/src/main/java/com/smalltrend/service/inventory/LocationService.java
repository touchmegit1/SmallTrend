package com.smalltrend.service.inventory;

import com.smalltrend.dto.inventory.location.FullLocationResponse;
import com.smalltrend.dto.inventory.location.LocationRequest;
import com.smalltrend.dto.inventory.location.LocationStockItemResponse;
import com.smalltrend.entity.InventoryStock;
import com.smalltrend.entity.Location;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.entity.StockMovement;
import com.smalltrend.repository.DisposalVoucherRepository;
import com.smalltrend.repository.InventoryCountRepository;
import com.smalltrend.repository.InventoryStockRepository;
import com.smalltrend.repository.LocationRepository;
import com.smalltrend.repository.PurchaseOrderRepository;
import com.smalltrend.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.smalltrend.exception.LocationException.conflict;
import static com.smalltrend.exception.LocationException.invalidRequest;
import static com.smalltrend.exception.LocationException.notFound;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;
    private final InventoryStockRepository inventoryStockRepository;
    private final StockMovementRepository stockMovementRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final InventoryCountRepository inventoryCountRepository;
    private final DisposalVoucherRepository disposalVoucherRepository;
    private final InventoryOutOfStockNotificationService outOfStockNotificationService;

    public List<FullLocationResponse> getAllLocations() {
        return locationRepository.findAll().stream()
                .map(this::toResponseWithStock)
                .collect(Collectors.toList());
    }

    public List<FullLocationResponse> getActiveLocations() {
        return locationRepository.findByStatus("ACTIVE").stream()
                .map(this::toResponseWithStock)
                .collect(Collectors.toList());
    }

    public FullLocationResponse getLocationById(Integer id) {
        return toResponseWithStock(getLocationOrThrow(id));
    }

    public List<LocationStockItemResponse> getLocationStockItems(Integer locationId) {
        getLocationOrThrow(locationId);
        return inventoryStockRepository.findByLocationIdWithProduct(locationId).stream()
                .map(this::toStockItemResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public FullLocationResponse createLocation(LocationRequest request) {
        String locationName = normalizeRequired(request.getLocationName(), "Tên vị trí không được để trống");
        String locationCode = normalizeRequired(request.getLocationCode(), "Mã vị trí không được để trống");
        String locationType = normalizeLocationType(
                normalizeRequired(request.getLocationType(), "Loại vị trí không được để trống")
        );

        if (locationRepository.existsByLocationCodeIgnoreCase(locationCode)) {
            throw conflict("Mã vị trí đã tồn tại");
        }

        Location loc = Location.builder()
                .name(locationName)
                .locationCode(locationCode)
                .warehouseType(locationType)
                .address(normalizeNullable(request.getAddress()))
                .capacity(request.getCapacity() != null ? request.getCapacity() : 0)
                .description(normalizeNullable(request.getDescription()))
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .build();

        return toResponseWithStock(locationRepository.save(loc));
    }

    @Transactional
    public FullLocationResponse updateLocation(Integer id, LocationRequest request) {
        Location loc = getLocationOrThrow(id);

        String locationName = normalizeRequired(request.getLocationName(), "Tên vị trí không được để trống");

        loc.setName(locationName);
        loc.setAddress(normalizeNullable(request.getAddress()));
        loc.setCapacity(request.getCapacity() != null ? request.getCapacity() : 0);
        loc.setDescription(normalizeNullable(request.getDescription()));

        return toResponseWithStock(locationRepository.save(loc));
    }

    @Transactional
    public void deleteLocation(Integer id) {
        getLocationOrThrow(id);

        if (inventoryStockRepository.existsByLocationIdAndQuantityGreaterThan(id, 0)) {
            throw conflict("Không thể xóa vị trí đang còn tồn kho");
        }
        if (purchaseOrderRepository.existsByLocationId(id)
                || inventoryCountRepository.existsByLocationId(id)
                || disposalVoucherRepository.existsByLocationId(id)) {
            throw conflict("Không thể xóa vị trí đang được tham chiếu trong nghiệp vụ");
        }

        locationRepository.deleteById(id);
    }

    @Transactional
    public void transferStock(Integer fromLocationId, Integer toLocationId,
                              Integer variantId, Integer batchId, int qty) {
        if (fromLocationId == null || toLocationId == null || variantId == null || batchId == null) {
            throw invalidRequest("Thiếu thông tin chuyển hàng");
        }
        if (fromLocationId.equals(toLocationId)) {
            throw invalidRequest("Vị trí nguồn và đích không được trùng nhau.");
        }
        if (qty <= 0) {
            throw invalidRequest("Số lượng chuyển phải lớn hơn 0.");
        }

        Location fromLoc = getLocationOrThrow(fromLocationId);
        Location toLoc = getLocationOrThrow(toLocationId);

        InventoryStock fromStock = inventoryStockRepository
                .findByVariantIdAndBatchIdAndLocationId(variantId, batchId, fromLocationId)
                .orElseThrow(() -> conflict("Không tìm thấy hàng hóa tại vị trí nguồn."));

        int available = fromStock.getQuantity() != null ? fromStock.getQuantity() : 0;
        if (qty > available) {
            throw conflict("Số lượng chuyển (" + qty + ") vượt quá tồn kho hiện có (" + available + ").");
        }

        int remaining = available - qty;
        if (remaining == 0) {
            outOfStockNotificationService.handleStockTransition(fromStock, available, 0, "TRANSFER_OUT");
            inventoryStockRepository.delete(fromStock);
        } else {
            fromStock.setQuantity(remaining);
            InventoryStock savedFromStock = inventoryStockRepository.save(fromStock);
            outOfStockNotificationService.handleStockTransition(savedFromStock, available, savedFromStock.getQuantity(), "TRANSFER_OUT");
        }

        Optional<InventoryStock> toStockOpt = inventoryStockRepository
                .findByVariantIdAndBatchIdAndLocationId(variantId, batchId, toLocationId);
        if (toStockOpt.isPresent()) {
            InventoryStock toStock = toStockOpt.get();
            int oldToQty = toStock.getQuantity() != null ? toStock.getQuantity() : 0;
            toStock.setQuantity(oldToQty + qty);
            InventoryStock savedToStock = inventoryStockRepository.save(toStock);
            outOfStockNotificationService.handleStockTransition(savedToStock, oldToQty, savedToStock.getQuantity(), "TRANSFER_IN");
        } else {
            InventoryStock newStock = InventoryStock.builder()
                    .variant(fromStock.getVariant())
                    .batch(fromStock.getBatch())
                    .location(toLoc)
                    .quantity(qty)
                    .build();
            InventoryStock savedNewStock = inventoryStockRepository.save(newStock);
            outOfStockNotificationService.handleStockTransition(savedNewStock, 0, savedNewStock.getQuantity(), "TRANSFER_IN");
        }

        stockMovementRepository.save(StockMovement.builder()
                .variant(fromStock.getVariant())
                .batch(fromStock.getBatch())
                .location(fromLoc)
                .type("OUT")
                .quantity(qty)
                .referenceType("TRANSFER")
                .notes("Chuyển " + qty + " sang " + toLoc.getName())
                .build());

        stockMovementRepository.save(StockMovement.builder()
                .variant(fromStock.getVariant())
                .batch(fromStock.getBatch())
                .location(toLoc)
                .type("IN")
                .quantity(qty)
                .referenceType("TRANSFER")
                .notes("Nhận " + qty + " từ " + fromLoc.getName())
                .build());
    }

    private Location getLocationOrThrow(Integer id) {
        return locationRepository.findById(id).orElseThrow(() -> notFound(id));
    }

    private String normalizeRequired(String value, String message) {
        String normalized = normalizeNullable(value);
        if (normalized == null || normalized.isBlank()) {
            throw invalidRequest(message);
        }
        return normalized;
    }

    private String normalizeLocationType(String value) {
        return "SHELF".equalsIgnoreCase(value) ? "DISPLAY" : value;
    }

    private String normalizeNullable(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String buildDisplayProductName(InventoryStock stock) {
        ProductVariant variant = stock.getVariant();
        if (variant == null || variant.getProduct() == null) {
            return "";
        }

        String productName = variant.getProduct().getName();
        Map<String, String> attributes = variant.getAttributes();
        if (attributes == null || attributes.isEmpty()) {
            return productName;
        }

        String attributeText = attributes.entrySet().stream()
                .filter(entry -> entry.getValue() != null && !entry.getValue().trim().isEmpty())
                .map(entry -> {
                    String key = entry.getKey() != null ? entry.getKey().trim() : "";
                    String value = entry.getValue().trim();
                    return key.isEmpty() ? value : key + " " + value;
                })
                .collect(Collectors.joining(" - "));

        if (attributeText.isBlank()) {
            return productName;
        }

        return productName + " - " + attributeText;
    }

    private FullLocationResponse toResponseWithStock(Location loc) {
        List<InventoryStock> stocks = inventoryStockRepository.findByLocationIdWithProduct(loc.getId());

        int totalProducts = stocks.stream()
                .mapToInt(s -> s.getQuantity() != null ? s.getQuantity() : 0)
                .sum();

        List<LocationStockItemResponse> stockItems = stocks.stream()
                .map(this::toStockItemResponse)
                .collect(Collectors.toList());

        return FullLocationResponse.builder()
                .id(loc.getId())
                .locationName(loc.getName())
                .locationCode(loc.getLocationCode() != null ? loc.getLocationCode() : "")
                .locationType(loc.getWarehouseType())
                .address(loc.getAddress() != null ? loc.getAddress() : "")
                .capacity(loc.getCapacity() != null ? loc.getCapacity() : 0)
                .description(loc.getDescription() != null ? loc.getDescription() : "")
                .status(loc.getStatus() != null ? loc.getStatus() : "ACTIVE")
                .createdAt(loc.getCreatedAt() != null ? loc.getCreatedAt().toString() : null)
                .totalProducts(totalProducts)
                .stockItems(stockItems)
                .build();
    }

    private LocationStockItemResponse toStockItemResponse(InventoryStock stock) {
        LocalDate expiryDate = stock.getBatch() != null ? stock.getBatch().getExpiryDate() : null;
        Integer daysUntilExpiry = null;
        String warningStatus = null;

        if (expiryDate != null) {
            daysUntilExpiry = (int) ChronoUnit.DAYS.between(LocalDate.now(), expiryDate);
            if (daysUntilExpiry < 0) {
                warningStatus = "EXPIRED";
            } else if (daysUntilExpiry <= 7) {
                warningStatus = "EXPIRING_CRITICAL";
            } else if (daysUntilExpiry <= 30) {
                warningStatus = "EXPIRING_WARNING";
            }
        }

        return LocationStockItemResponse.builder()
                .variantId(stock.getVariant() != null ? stock.getVariant().getId() : null)
                .sku(stock.getVariant() != null ? stock.getVariant().getSku() : "")
                .productName(buildDisplayProductName(stock))
                .variantUnit(stock.getVariant() != null && stock.getVariant().getUnit() != null
                        ? stock.getVariant().getUnit().getName() : "")
                .quantity(stock.getQuantity() != null ? stock.getQuantity() : 0)
                .batchCode(stock.getBatch() != null ? stock.getBatch().getBatchNumber() : "")
                .batchId(stock.getBatch() != null ? stock.getBatch().getId() : null)
                .expiryDate(expiryDate != null ? expiryDate.toString() : null)
                .daysUntilExpiry(daysUntilExpiry)
                .warningStatus(warningStatus)
                .build();
    }
}
