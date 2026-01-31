import React from 'react';

/**
 * StatCard - Thẻ hiển thị thống kê
 * Đơn giản với inline CSS, dễ hiểu cho người mới
 */
function StatCard({ title, value, subtitle }) {
    return (
        <div style={{
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '10px'
        }}>
            {/* Tiêu đề */}
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                {title}
            </div>
            
            {/* Số liệu chính - to và đậm */}
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                {value}
            </div>
            
            {/* Mô tả phụ */}
            <div style={{ fontSize: '12px', color: '#999' }}>
                {subtitle}
            </div>
        </div>
    );
}

export default StatCard;
