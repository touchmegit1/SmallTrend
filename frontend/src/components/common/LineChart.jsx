import React from 'react';
function LineChart({ data }) {
    return (
        <div style={{
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px'
        }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                Xu hướng giá trị tồn kho
            </h3>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '15px' }}>
                Diễn biến tháng này (triệu đồng)
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Ngày</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Giá trị</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px' }}>{item.date}</td>
                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>
                                {item.value.toLocaleString()} triệu
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default LineChart;
