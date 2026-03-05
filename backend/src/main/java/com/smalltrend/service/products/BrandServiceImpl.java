package com.smalltrend.service.products;

import com.smalltrend.entity.Brand;
import com.smalltrend.repository.BrandRepository;
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
    private final com.smalltrend.repository.ProductRepository productRepository;

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
        return brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found"));
    }

    // Cập nhật Tên, Quốc gia và Mô tả của Thương hiệu hiện có
    @Override
    public Brand update(Integer id, Brand brand) {
        Brand existing = getById(id);
        existing.setName(brand.getName());
        existing.setCountry(brand.getCountry());
        existing.setDescription(brand.getDescription());
        return brandRepository.save(existing);
    }

    // Xoá Thương hiệu (Kiểm tra tính toàn vẹn: Chặn xóa nếu đang có Product nào
    // liên kết với Brand này)
    @Override
    public void delete(Integer id) {
        if (productRepository.existsByBrandId(id)) {
            throw new RuntimeException("Không thể xoá thương hiệu vì đang có sản phẩm thuộc thương hiệu này");
        }
        brandRepository.deleteById(id);
    }
}
