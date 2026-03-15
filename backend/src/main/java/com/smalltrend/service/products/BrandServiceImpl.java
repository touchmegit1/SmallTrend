package com.smalltrend.service.products;

import com.smalltrend.entity.Brand;
import com.smalltrend.repository.BrandRepository;
import com.smalltrend.validation.product.BrandValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service Implementation xử lý logic nghiệp vụ cho Entity Thương hiệu (Brand)
 */
@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final BrandValidator brandValidator;

    // Lưu mới Thương hiệu vào Database
    @Override
    public Brand create(Brand brand) {
        return brandRepository.save(brand);
    }

    // Truy xuất danh sách toàn bộ Thương hiệu
    @Override
    public List<Brand> getAll() {
        return brandRepository.findAll();
    }

    // Tìm Brand theo ID, nếu không tìm thấy sẽ bắn ngoại lệ
    @Override
    public Brand getById(Integer id) {
        return brandValidator.requireExistingBrand(id);
    }

    @Override
    public Brand update(Integer id, Brand brand) {
        Brand existing = getById(id);
        existing.setName(brand.getName());
        existing.setCountry(brand.getCountry());
        existing.setDescription(brand.getDescription());
        existing.setCategory(brand.getCategory());
        existing.setSupplier(brand.getSupplier());
        return brandRepository.save(existing);
    }

    // Xoá Thương hiệu (Kiểm tra tính toàn vẹn: Chặn xóa nếu đang có Product nào
    // liên kết với Brand này)
    @Override
    public void delete(Integer id) {
        brandValidator.validateDeletable(id);
        brandRepository.deleteById(id);
    }
}
