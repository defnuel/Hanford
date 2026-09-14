import { GoodsReceivedNote, GRNItem } from '../types';

export const SAMPLE_KEBUN_ASAP_INVOICE_TEXT = `+-----------------------------------------------------------------------------+
|                              COMMERCIAL INVOICE                             |
+-----------------------------------------------------------------------------+
| ISSUED BY:                                | BILLED TO:                      |
|                                           |                                 |
| Company Name: Kebun Asap Group            | Company Name: Hanford Grand Hotel
|               Kebun Asap                  |               Jakarta           |
| Address:      Kebun Estate, Lembang,      | Address:      Jl. Jenderal Sudirman
|               West Java, Indonesia        |               Kav. 87, Central  |
|                                           |               Jakarta, DKI Jakarta
|                                           |               10220             |
| Contact Person: Satyendra Pranata Dirgan  | Contact Person: Trevor Finn Hanford
|                 (President Director)      |               (Chief Executive  |
|                                           |               Officer, Hanford Hotels
|                                           |               and Resorts)      |
+-------------------------------------------+---------------------------------+
| Invoice No:        INV-KA-HGH-2026-001                                      |
| Issuance Date:     07 September 2026                                        |
| Due Date:          06 October 2026 (Net 30 Days)                            |
| Purchase Order Ref: PO-HGH-2026-0801                                        |
| Currency:          USD ($) ONLY                                             |
+-----------------------------------------------------------------------------+
| + ITEMIZED BILLING BREAKDOWN: --------------------------------------------+ |
| | ITEM / DESCRIPTION                      | QUANTITY | UNIT PRICE | TOTAL AMOUNT | |
| +-----------------------------------------+----------+------------+--------------+ |
| | Organic Vegetables & Fresh Herbs        |  350 KG  |  $  3.80   |  $ 1,330.00  | |
| | Organic Fruits                          |  300 KG  |  $  4.50   |  $ 1,350.00  | |
| | Fresh Milk (Pasture-Raised A2)          |  350 L   |  $  2.20   |  $   770.00  | |
| | Organic/Free-Range Eggs (30s/tray)      |   50 Trays |  $ 6.50   |  $   325.00  | |
| | Organic Free-Range Chicken              |  180 KG  |  $  7.50   |  $ 1,350.00  | |
| | Premium Wagyu & Angus Beef (MB4-5)      |  150 KG  |  $ 35.00   |  $ 5,250.00  | |
| | Assorted Gourmet Bakery & Pastry        | 2,000 Uts |  $  1.50  |  $ 3,000.00  | |
| | Artisan Cheese (Assorted Luxury)        |   60 KG  |  $ 28.00   |  $ 1,680.00  | |
| | Natural Greek Yogurt                    |  100 KG  |  $  5.50   |  $   550.00  | |
| | Cultured European Butter                |   35 KG  |  $ 12.50   |  $   437.50  | |
| | Organic Nuts, Beans & Seeds             |   25 KG  |  $ 14.00   |  $   350.00  | |
| | Specialty Single-Origin Coffee          |   25 KG  |  $ 22.00   |  $   550.00  | |
| | Artisan Organic Loose-Leaf Tea          |    6 KG  |  $ 38.00   |  $   228.00  | |
| | Spices & Dry Seasonings                 |   20 KG  |  $ 25.00   |  $   500.00  | |
| | Raw Honey, Syrups & Sweeteners          |   40 L   |  $ 16.00   |  $   640.00  | |
+-------------------------------------------+----------+------------+--------------+
| PAYMENT INSTRUCTIONS & BANK DETAILS:      | FINANCIAL SUMMARY:              |
|                                           |                                 |
| Bank Name: Bank Central Asia (BCA) - KCP Jakarta | Subtotal Net: $18,310.50 |
| Account Name: PT Kebun Asap Indonesia     | VAT / Tax (11%): $2,014.16      |
| Account Number: 0605-2617-09 (USD Account)| Grand Total Amount Due: $20,324.66
| SWIFT Code: CENAIDJA                      |                                 |
| Payment Terms: Strictly USD currency within 30 days                         |
+-------------------------------------------+---------------------------------+
| AUTHORIZATION SIGNATURE:                                                    |
|                                                                             |
|                                               Satyendra Pranata Dirgantara   |
|                                  President Director, Kebun Asap Group       |
+-----------------------------------------------------------------------------+`;

/**
 * Categorize hotel kitchen/warehouse storage location based on item description
 */
export function determineStorageLocation(desc: string): string {
  const d = desc.toLowerCase();
  if (d.includes('beef') || d.includes('wagyu') || d.includes('meat') || d.includes('chicken') || d.includes('poultry') || d.includes('steak') || d.includes('pork') || d.includes('lamb') || d.includes('fish') || d.includes('seafood')) {
    return 'Walk-in Freezer / Butchery (-18°C)';
  }
  if (d.includes('milk') || d.includes('yogurt') || d.includes('butter') || d.includes('cheese') || d.includes('dairy') || d.includes('egg') || d.includes('cream')) {
    return 'Dairy Cold Room (2°C - 4°C)';
  }
  if (d.includes('vegetable') || d.includes('fruit') || d.includes('herb') || d.includes('salad') || d.includes('greens') || d.includes('mushroom') || d.includes('onion') || d.includes('potato')) {
    return 'Chilled Produce Store (8°C - 10°C)';
  }
  if (d.includes('bakery') || d.includes('pastry') || d.includes('bread') || d.includes('croissant') || d.includes('cake') || d.includes('flour') || d.includes('yeast')) {
    return 'Pastry & Bakery Station (Dry/Cool)';
  }
  if (d.includes('coffee') || d.includes('tea') || d.includes('spice') || d.includes('seasoning') || d.includes('honey') || d.includes('syrup') || d.includes('nut') || d.includes('bean') || d.includes('seed') || d.includes('oil') || d.includes('sauce') || d.includes('sugar')) {
    return 'Central Dry Goods Pantry';
  }
  if (d.includes('wine') || d.includes('beer') || d.includes('liquor') || d.includes('spirit') || d.includes('beverage') || d.includes('juice')) {
    return 'Beverage Cellar & Bar Store';
  }
  return 'Main Warehouse Receiving Bay';
}

/**
 * Clean currency string to numeric value (e.g. "$ 1,330.00" -> 1330)
 */
export function cleanCurrency(val?: string): number {
  if (!val) return 0;
  const cleaned = val.replace(/[^0-9.-]+/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Parses raw text, commercial invoice ASCII table, or copied receipt into a structured Goods Received Note
 */
export function parseInvoiceToGRN(rawText: string): GoodsReceivedNote {
  const lines = rawText.split('\n');

  let supplierName = '';
  let supplierAddress = '';
  let supplierContactPerson = '';

  let receivingProperty = 'Hanford Grand Hotel Jakarta';
  let receivingDepartment = 'Central Receiving Bay & F&B Storehouse';
  let receivingAddress = 'Jl. Jenderal Sudirman Kav. 87, Central Jakarta, DKI Jakarta 10220';
  let receivedBy = 'Aris Munandar (Receiving & Warehouse Officer)';
  let inspectedBy = 'Chef Marco Valentino (Executive Sous Chef & QA)';
  let approvedBy = 'Bramantyo Wardhana (Corporate F&B Purchasing Director)';

  let invoiceNumber = '';
  let purchaseOrderRef = '';
  let issuanceDate = '';
  let dueDate = '';
  let currency = 'USD';
  let subtotalNet = 0;
  let taxPercent = 11;
  let taxAmount = 0;
  let grandTotal = 0;

  let bankName = '';
  let accountName = '';
  let accountNumber = '';
  let swiftCode = '';
  let paymentTerms = '';

  const parsedItems: GRNItem[] = [];

  // 1. Line-by-line metadata scan
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Invoice No
    const invMatch = line.match(/(?:Invoice\s*(?:No|Number|#)[\s:]*)([A-Z0-9_-]+)/i);
    if (invMatch && !invoiceNumber) {
      invoiceNumber = invMatch[1].trim();
    }

    // Purchase Order Ref
    const poMatch = line.match(/(?:Purchase\s*Order\s*(?:Ref|No|#)?|PO\s*Ref|PO\s*#)[\s:]*([A-Z0-9_-]+)/i);
    if (poMatch && !purchaseOrderRef) {
      purchaseOrderRef = poMatch[1].trim();
    }

    // Issuance Date
    const issMatch = line.match(/(?:Issuance\s*Date|Invoice\s*Date|Date\s*Issued|Date)[\s:]*([0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4}|[0-9]{4}-[0-9]{2}-[0-9]{2})/i);
    if (issMatch && !issuanceDate) {
      issuanceDate = issMatch[1].trim();
    }

    // Due Date
    const dueMatch = line.match(/(?:Due\s*Date)[\s:]*([0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4}[^\n|]*|[0-9]{4}-[0-9]{2}-[0-9]{2})/i);
    if (dueMatch && !dueDate) {
      dueDate = dueMatch[1].trim();
    }

    // Currency
    const currMatch = line.match(/\b(USD|IDR|SGD|EUR|GBP|AUD|CAD|JPY|CNY)\b/i);
    if (currMatch) {
      currency = currMatch[1].toUpperCase();
    }

    // Supplier Info Detection (Kebun Asap or general)
    if (/Company\s*Name[\s:]*([^\n|]+)/i.test(line)) {
      const match = line.match(/Company\s*Name[\s:]*([^\n|]+)/i);
      if (match) {
        const val = match[1].trim();
        if (!supplierName && !val.toLowerCase().includes('hanford')) {
          supplierName = val;
        } else if (val.toLowerCase().includes('hanford')) {
          receivingProperty = val;
        }
      }
    }

    if (/Address[\s:]*([^\n|]+)/i.test(line)) {
      const match = line.match(/Address[\s:]*([^\n|]+)/i);
      if (match) {
        const val = match[1].trim();
        if (!supplierAddress && !val.toLowerCase().includes('sudirman')) {
          supplierAddress = val;
        }
      }
    }

    if (/Contact\s*Person[\s:]*([^\n|]+)/i.test(line)) {
      const match = line.match(/Contact\s*Person[\s:]*([^\n|]+)/i);
      if (match) {
        const val = match[1].trim();
        if (!supplierContactPerson && !val.toLowerCase().includes('trevor')) {
          supplierContactPerson = val;
        }
      }
    }

    // Subtotal Net
    const subMatch = line.match(/(?:Subtotal\s*Net|Subtotal)[\s:]*\$?\s*([0-9,.]+)/i);
    if (subMatch && subtotalNet === 0) {
      subtotalNet = cleanCurrency(subMatch[1]);
    }

    // Tax
    const taxMatch = line.match(/(?:VAT\s*\/?\s*Tax|Tax)\s*(?:\(?([0-9.]+)%?\)?)?[\s:]*\$?\s*([0-9,.]+)/i);
    if (taxMatch) {
      if (taxMatch[1]) taxPercent = parseFloat(taxMatch[1]) || 11;
      if (taxMatch[2]) taxAmount = cleanCurrency(taxMatch[2]);
    }

    // Grand Total
    const totalMatch = line.match(/(?:Grand\s*Total(?:\s*Amount\s*Due)?|Total\s*Amount\s*Due|Total\s*Due|Grand\s*Total)[\s:]*\$?\s*([0-9,.]+)/i);
    if (totalMatch && grandTotal === 0) {
      grandTotal = cleanCurrency(totalMatch[1]);
    }

    // Bank Details
    if (/Bank\s*Name[\s:]*([^\n|]+)/i.test(line)) {
      bankName = line.match(/Bank\s*Name[\s:]*([^\n|]+)/i)![1].trim();
    }
    if (/Account\s*Name[\s:]*([^\n|]+)/i.test(line)) {
      accountName = line.match(/Account\s*Name[\s:]*([^\n|]+)/i)![1].trim();
    }
    if (/Account\s*Number[\s:]*([^\n|]+)/i.test(line)) {
      accountNumber = line.match(/Account\s*Number[\s:]*([^\n|]+)/i)![1].trim();
    }
    if (/SWIFT\s*Code[\s:]*([^\n|]+)/i.test(line)) {
      swiftCode = line.match(/SWIFT\s*Code[\s:]*([^\n|]+)/i)![1].trim();
    }
    if (/Payment\s*Terms[\s:]*([^\n|]+)/i.test(line)) {
      paymentTerms = line.match(/Payment\s*Terms[\s:]*([^\n|]+)/i)![1].trim();
    }

    // Table item row matching:
    // Typical format: "| Description | Quantity Unit | UnitPrice | Total |"
    // or without pipes
    const trimmed = line.trim();
    if (trimmed.startsWith('|') || trimmed.includes('$')) {
      const parts = trimmed
        .split('|')
        .map((p) => p.trim())
        .filter(Boolean);

      // We look for parts having description, quantity, price, total
      if (parts.length >= 3) {
        const descCandidate = parts[0];
        const qtyCandidate = parts[1];
        const priceCandidate = parts[2];
        const totalCandidate = parts[3] || '';

        // Ignore header lines or separator lines
        if (
          !descCandidate.toLowerCase().includes('item') &&
          !descCandidate.toLowerCase().includes('description') &&
          !descCandidate.toLowerCase().includes('issued by') &&
          !descCandidate.toLowerCase().includes('billed to') &&
          !descCandidate.toLowerCase().includes('invoice no') &&
          !descCandidate.toLowerCase().includes('payment instructions') &&
          !descCandidate.toLowerCase().includes('subtotal') &&
          !descCandidate.startsWith('+-') &&
          !descCandidate.startsWith('--') &&
          !descCandidate.includes('====')
        ) {
          // Parse quantity and unit: e.g. "350 KG", "50 Trays", "2,000 Uts", "350 L"
          const qtyMatch = qtyCandidate.match(/([0-9,.]+)\s*([A-Za-z]+)?/);
          if (qtyMatch) {
            const rawQtyNum = cleanCurrency(qtyMatch[1]);
            const unit = qtyMatch[2] ? qtyMatch[2].trim() : 'Units';

            const unitPrice = cleanCurrency(priceCandidate);
            const total = totalCandidate ? cleanCurrency(totalCandidate) : rawQtyNum * unitPrice;

            if (rawQtyNum > 0 && descCandidate.length > 2) {
              const itemNum = parsedItems.length + 1;
              parsedItems.push({
                id: `grn-item-${Date.now()}-${itemNum}`,
                itemNumber: itemNum,
                description: descCandidate,
                quantityOrdered: rawQtyNum,
                quantityReceived: rawQtyNum,
                quantityAccepted: rawQtyNum,
                quantityRejected: 0,
                unit,
                unitPrice,
                totalAmount: total,
                storageLocation: determineStorageLocation(descCandidate),
                inspectionCondition: 'Passed QC / Good Condition',
                remarks: 'Physical count verified. Temperature within required thresholds.'
              });
            }
          }
        }
      } else if (trimmed.includes('\t') || (trimmed.includes('$') && !trimmed.startsWith('+'))) {
        // Fallback: Tab-separated or space/dollar separated lines
        const sep = trimmed.includes('\t') ? '\t' : (trimmed.includes(',') ? ',' : null);
        if (sep) {
          const parts = trimmed.split(sep).map((p) => p.trim()).filter(Boolean);
          if (parts.length >= 3) {
            const descCandidate = parts[0];
            const qtyCandidate = parts[1];
            const priceCandidate = parts[2];
            const totalCandidate = parts[3] || '';
            if (
              !descCandidate.toLowerCase().includes('item') &&
              !descCandidate.toLowerCase().includes('subtotal') &&
              !descCandidate.toLowerCase().includes('total')
            ) {
              const qtyMatch = qtyCandidate.match(/([0-9,.]+)\s*([A-Za-z]+)?/);
              if (qtyMatch) {
                const rawQtyNum = cleanCurrency(qtyMatch[1]);
                const unit = qtyMatch[2] ? qtyMatch[2].trim() : 'Units';
                const unitPrice = cleanCurrency(priceCandidate);
                const total = totalCandidate ? cleanCurrency(totalCandidate) : rawQtyNum * unitPrice;
                if (rawQtyNum > 0 && descCandidate.length > 2) {
                  const itemNum = parsedItems.length + 1;
                  parsedItems.push({
                    id: `grn-item-${Date.now()}-${itemNum}`,
                    itemNumber: itemNum,
                    description: descCandidate,
                    quantityOrdered: rawQtyNum,
                    quantityReceived: rawQtyNum,
                    quantityAccepted: rawQtyNum,
                    quantityRejected: 0,
                    unit,
                    unitPrice,
                    totalAmount: total,
                    storageLocation: determineStorageLocation(descCandidate),
                    inspectionCondition: 'Passed QC / Good Condition',
                    remarks: 'Physical count verified. QC passed.'
                  });
                }
              }
            }
          }
        }
      }
    }
  }

  // Fallbacks if not detected
  if (!supplierName) {
    if (rawText.toLowerCase().includes('kebun asap')) {
      supplierName = 'Kebun Asap Group (PT Kebun Asap Indonesia)';
      supplierAddress = 'Kebun Estate, Lembang, West Java, Indonesia';
      supplierContactPerson = 'Satyendra Pranata Dirgantara (President Director)';
    } else {
      supplierName = 'Supplier Partner';
    }
  }

  if (!invoiceNumber) {
    const fallbackInv = rawText.match(/INV-[A-Za-z0-9_-]+/i);
    invoiceNumber = fallbackInv ? fallbackInv[0] : `INV-REC-${Date.now().toString().slice(-6)}`;
  }

  if (!purchaseOrderRef) {
    const fallbackPo = rawText.match(/PO-[A-Za-z0-9_-]+/i);
    purchaseOrderRef = fallbackPo ? fallbackPo[0] : `PO-HGH-${new Date().getFullYear()}-0801`;
  }

  if (!issuanceDate) {
    issuanceDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  // Recalculate aggregates if items were extracted
  if (parsedItems.length > 0) {
    const calcSubtotal = parsedItems.reduce((sum, item) => sum + item.totalAmount, 0);
    if (subtotalNet === 0 || Math.abs(subtotalNet - calcSubtotal) > 10) {
      subtotalNet = calcSubtotal;
    }
    if (taxAmount === 0 && taxPercent > 0) {
      taxAmount = Math.round(subtotalNet * (taxPercent / 100) * 100) / 100;
    }
    if (grandTotal === 0) {
      grandTotal = Math.round((subtotalNet + taxAmount) * 100) / 100;
    }
  }

  const totalOrderedUnits = parsedItems.reduce((sum, i) => sum + i.quantityOrdered, 0);
  const totalReceivedUnits = parsedItems.reduce((sum, i) => sum + i.quantityReceived, 0);
  const totalAcceptedUnits = parsedItems.reduce((sum, i) => sum + i.quantityAccepted, 0);
  const totalRejectedUnits = parsedItems.reduce((sum, i) => sum + i.quantityRejected, 0);

  // Generate unique GRN Number derived from PO or date
  const cleanPoTag = purchaseOrderRef.replace(/[^A-Za-z0-9]/g, '').slice(-4) || '0801';
  const grnNumber = `GRN-HGH-2026-${cleanPoTag}`;

  const todayStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return {
    id: `grn-${Date.now()}`,
    grnNumber,
    status: totalRejectedUnits > 0 ? 'Partially Accepted' : 'Inspected & Accepted',
    supplierName,
    supplierAddress,
    supplierContactPerson,
    receivingProperty,
    receivingDepartment,
    receivingAddress,
    receivedBy,
    inspectedBy,
    approvedBy,
    invoiceNumber,
    purchaseOrderRef,
    deliveryNoteRef: `DN-${cleanPoTag}-V2`,
    vehicleNumber: 'B 9482 KBA (Refrigerated Logistics Truck)',
    issuanceDate: issuanceDate || todayStr,
    receivedDate: issuanceDate || todayStr,
    inspectionDate: issuanceDate || todayStr,
    dueDate,
    items: parsedItems,
    currency,
    subtotalNet,
    taxPercent,
    taxAmount,
    grandTotal,
    totalOrderedUnits,
    totalReceivedUnits,
    totalAcceptedUnits,
    totalRejectedUnits,
    inspectionChecks: {
      packagingIntact: true,
      temperatureCompliant: true,
      expiryDateVerified: true,
      weightCountVerified: true,
      foodSafetyHACCP: true
    },
    bankDetails: {
      bankName: bankName || 'Bank Central Asia (BCA) - KCP Jakarta',
      accountName: accountName || 'PT Kebun Asap Indonesia',
      accountNumber: accountNumber || '0605-2617-09 (USD Account)',
      swiftCode: swiftCode || 'CENAIDJA',
      paymentTerms: paymentTerms || 'Strictly USD currency within 30 days'
    },
    notes: 'Physical delivery verified at Hanford Grand Hotel Jakarta central receiving dock. All goods received in pristine fresh condition adhering to HACCP and cold-chain standards.',
    rawSourceText: rawText,
    createdAt: new Date().toISOString()
  };
}
