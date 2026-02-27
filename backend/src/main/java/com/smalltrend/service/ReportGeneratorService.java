package com.smalltrend.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class ReportGeneratorService {

    public byte[] generatePdf(String title, List<String> headers, List<List<String>> data) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Title
            Paragraph titlePara = new Paragraph(title)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(18)
                    .setBold();
            document.add(titlePara);

            // Table
            Table table = new Table(UnitValue.createPercentArray(headers.size())).useAllAvailableWidth();

            // Header
            for (String header : headers) {
                table.addHeaderCell(new Paragraph(header).setBold());
            }

            // Data
            for (List<String> row : data) {
                for (String cell : row) {
                    table.addCell(new Paragraph(cell != null ? cell : ""));
                }
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
        return out.toByteArray();
    }

    public byte[] generateExcel(String sheetName, List<String> headers, List<List<String>> data) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet(sheetName);

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            // Header Row
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.size(); i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers.get(i));
                cell.setCellStyle(headerStyle);
            }

            // Data Rows
            int rowNum = 1;
            for (List<String> rowData : data) {
                Row row = sheet.createRow(rowNum++);
                for (int i = 0; i < rowData.size(); i++) {
                    row.createCell(i).setCellValue(rowData.get(i) != null ? rowData.get(i) : "");
                }
            }

            // Auto-size columns
            for (int i = 0; i < headers.size(); i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Excel", e);
        }
    }
    public byte[] generateCsv(String title, List<String> headers, List<List<String>> data) {
        StringBuilder csv = new StringBuilder();

        // Add Title (Optional for CSV, but included as comment or first line if needed.
        // Usually CSVs just start with headers. Let's add it as a comment or skip it based on standard CSV usage.
        // For this requirement, let's keep it simple: Title line, then Headers, then Data)
        // Actually, to keep it machine-readable, maybe just headers.
        // But the other reports have titles. Let's add the title in the first row.
        csv.append(escapeCsv(title)).append("\n");

        // Headers
        for (int i = 0; i < headers.size(); i++) {
            csv.append(escapeCsv(headers.get(i)));
            if (i < headers.size() - 1) {
                csv.append(",");
            }
        }
        csv.append("\n");

        // Data
        for (List<String> row : data) {
            for (int i = 0; i < row.size(); i++) {
                csv.append(escapeCsv(row.get(i) != null ? row.get(i) : ""));
                if (i < row.size() - 1) {
                    csv.append(",");
                }
            }
            csv.append("\n");
        }

        return csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    private String escapeCsv(String data) {
        if (data == null) {
            return "";
        }
        String escaped = data.replaceAll("\"", "\"\"");
        if (data.contains(",") || data.contains("\n") || data.contains("\"")) {
            return "\"" + escaped + "\"";
        }
        return data;
    }
}
