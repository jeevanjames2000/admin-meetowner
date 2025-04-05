
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Building2, FileText } from 'lucide-react';
import companyLogo from '../../../public/images/logo.png';

// PDF styles
const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    backgroundColor: '#ffffff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  companyInfo: {
    flex: 1
  },
  logo: {
    width: 100,
    height: 50,
    marginBottom: 10
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2563eb'
  },
  subtitle: {
    fontSize: 10,
    color: '#4b5563',
    marginBottom: 4
  },
  invoiceInfo: {
    alignItems: 'flex-end'
  },
  invoiceDetails: {
    fontSize: 10,
    marginBottom: 4
  },
  clientSection: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937'
  },
  table: {
    marginTop: 10,
    marginBottom: 20
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 8
  },
  description: { width: '40%', fontSize: 10 },
  hsn: { width: '15%', fontSize: 10 },
  qty: { width: '10%', fontSize: 10, textAlign: 'right' },
  rate: { width: '15%', fontSize: 10, textAlign: 'right' },
  gst: { width: '10%', fontSize: 10, textAlign: 'right' },
  amount: { width: '10%', fontSize: 10, textAlign: 'right' },
  totalSection: {
    marginTop: 20,
    alignItems: 'flex-end'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4
  },
  totalLabel: {
    width: 100,
    fontSize: 10,
    textAlign: 'right',
    marginRight: 10
  },
  totalAmount: {
    width: 100,
    fontSize: 10,
    textAlign: 'right'
  },
  grandTotal: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  footer: {
    position: 'absolute',
    bottom: 15,
    left: 30,
    right: 30
  },
  footerText: {
    fontSize: 10,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 4
  },
  bankDetails: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10
  },
  bankDetailsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8
  },
  bankDetailsText: {
    fontSize: 10,
    color: '#4b5563',
    marginBottom: 4
  },
  termsAndConditions: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10
  }
});

// Invoice data
const invoiceData = {
  number: 'INV-2024-001',
  date: '2024-03-03',
  dueDate: '2024-03-17',
  company: {
    name: 'MEET OWNER',
    address: 'H.No 2-32/B, Friends Colony',
    city: 'Hyderabad',
    state: 'Telangana',
    zip: '500050',
    gstin: '36ABVFM6524D1ZZ',
    email: 'info@meetowner.com',
    phone: '+91 9876543210'
  },
  client: {
    name: 'CMR AUTOMOTIVES PRIVATE LIMITED',
    gstin: '37AAGCC5611G1ZU',
    placeOfSupply: 'Andhra Pradesh (37)',
    address: '123, Industrial Area',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    zip: '520001'
  },
  items: [
    {
      description: 'Digital Real eState Services',
      hsn: '998314',
      qty: 1,
      rate: 20000,
      gst: 18,
      amount: 20000
    }
  ],
  bankDetails: {
    bankName: 'HDFC Bank',
    accountName: 'Meet Owner',
    accountNumber: 'XXXX XXXX XXXX 1234',
    ifscCode: 'HDFC0001234',
    branchName: 'Hyderabad Main Branch'
  },
  terms: [
    'Payment is due within 14 days',
    'Late payment may incur additional charges',
    'All prices are in Indian Rupees (INR)',
    'This is a computer-generated invoice, no signature required'
  ]
};

// Helper function to convert number to words
const numberToWords = (num: number) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  if (num === 0) return 'Zero';

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    
    if (n < 10) return ones[n];
    
    if (n < 20) return teens[n - 10];
    
    if (n < 100) {
      return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    }
    
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
  };

  const convertLakh = (n: number): string => {
    if (n === 0) return '';
    return convertLessThanThousand(Math.floor(n / 100000)) + ' Lakh ' + 
           convertLessThanThousand(n % 100000);
  };

  return convertLakh(num).trim() + ' Rupees Only';
};

// PDF Document Component
const InvoicePDF = () => {
  const subtotal = invoiceData.items.reduce((acc, item) => acc + item.amount, 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.header}>
          <View style={pdfStyles.companyInfo}>
            <Text style={pdfStyles.title}>TAX INVOICE</Text>
            <Image src={companyLogo} style={pdfStyles.logo} />
            <Text style={pdfStyles.subtitle}>{invoiceData.company.name}</Text>
            <Text style={pdfStyles.subtitle}>{invoiceData.company.address}</Text>
            <Text style={pdfStyles.subtitle}>
              {invoiceData.company.city}, {invoiceData.company.state} {invoiceData.company.zip}
            </Text>
            <Text style={pdfStyles.subtitle}>GSTIN: {invoiceData.company.gstin}</Text>
            <Text style={pdfStyles.subtitle}>Email: {invoiceData.company.email}</Text>
            <Text style={pdfStyles.subtitle}>Phone: {invoiceData.company.phone}</Text>
          </View>
          <View style={pdfStyles.invoiceInfo}>
            <Text style={pdfStyles.invoiceDetails}>Invoice #{invoiceData.number}</Text>
            <Text style={pdfStyles.invoiceDetails}>Date: {invoiceData.date}</Text>
            <Text style={pdfStyles.invoiceDetails}>Due Date: {invoiceData.dueDate}</Text>
          </View>
        </View>

        {/* Client Info */}
        <View style={pdfStyles.clientSection}>
          <Text style={pdfStyles.sectionTitle}>Bill To:</Text>
          <Text style={pdfStyles.subtitle}>{invoiceData.client.name}</Text>
          <Text style={pdfStyles.subtitle}>{invoiceData.client.address}</Text>
          <Text style={pdfStyles.subtitle}>
            {invoiceData.client.city}, {invoiceData.client.state} {invoiceData.client.zip}
          </Text>
          <Text style={pdfStyles.subtitle}>GSTIN: {invoiceData.client.gstin}</Text>
          <Text style={pdfStyles.subtitle}>Place of Supply: {invoiceData.client.placeOfSupply}</Text>
        </View>

        {/* Table */}
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={pdfStyles.description}>Description</Text>
            <Text style={pdfStyles.hsn}>HSN/SAC</Text>
            <Text style={pdfStyles.qty}>Qty</Text>
            <Text style={pdfStyles.rate}>Rate</Text>
            <Text style={pdfStyles.gst}>GST%</Text>
            <Text style={pdfStyles.amount}>Amount</Text>
          </View>
          {invoiceData.items.map((item, index) => (
            <View key={index} style={pdfStyles.tableRow}>
              <Text style={pdfStyles.description}>{item.description}</Text>
              <Text style={pdfStyles.hsn}>{item.hsn}</Text>
              <Text style={pdfStyles.qty}>{item.qty}</Text>
              <Text style={pdfStyles.rate}>₹{item.rate.toLocaleString()}</Text>
              <Text style={pdfStyles.gst}>{item.gst}%</Text>
              <Text style={pdfStyles.amount}>₹{item.amount.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={pdfStyles.totalSection}>
          <View style={pdfStyles.totalRow}>
            <Text style={pdfStyles.totalLabel}>Subtotal:</Text>
            <Text style={pdfStyles.totalAmount}>₹{subtotal.toLocaleString()}</Text>
          </View>
          <View style={pdfStyles.totalRow}>
            <Text style={pdfStyles.totalLabel}>GST (18%):</Text>
            <Text style={pdfStyles.totalAmount}>₹{gst.toLocaleString()}</Text>
          </View>
          <View style={[pdfStyles.totalRow, pdfStyles.grandTotal]}>
            <Text style={pdfStyles.totalLabel}>Total:</Text>
            <Text style={pdfStyles.totalAmount}>₹{total.toLocaleString()}</Text>
          </View>
          <Text style={pdfStyles.subtitle}>Amount in words: {numberToWords(total)}</Text>
        </View>

        {/* Bank Details */}
       

        {/* Terms and Conditions */}
        <View style={pdfStyles.termsAndConditions}>
          <Text style={pdfStyles.bankDetailsTitle}>Terms and Conditions:</Text>
          {invoiceData.terms.map((term, index) => (
            <Text key={index} style={pdfStyles.bankDetailsText}>• {term}</Text>
          ))}
        </View>

        {/* Footer */}
        <View style={pdfStyles.footer}>
          <Text style={pdfStyles.footerText}>Thank you for your business!</Text>
          <Text style={pdfStyles.footerText}>For any queries, please contact us at {invoiceData.company.email}</Text>
        </View>
      </Page>
    </Document>
  );
};

// Web Invoice Component
const Invoice = () => {
  const subtotal = invoiceData.items.reduce((acc, item) => acc + item.amount, 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
    
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-8 border-b">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-blue-600">TAX INVOICE</h1>
            </div>
            <div className="text-sm text-gray-600">
            <img 
                src={companyLogo} 
                alt="Company Logo" 
                className="w-24 h-12 mb-2 object-contain"
              />
              <p className="font-semibold">{invoiceData.company.name}</p>
              <p>{invoiceData.company.address}</p>
              <p>{invoiceData.company.city}, {invoiceData.company.state} {invoiceData.company.zip}</p>
              <p>GSTIN: {invoiceData.company.gstin}</p>
              <p>Email: {invoiceData.company.email}</p>
              <p>Phone: {invoiceData.company.phone}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold">Invoice #{invoiceData.number}</p>
            <p className="text-sm text-gray-600">Date: {invoiceData.date}</p>
            <p className="text-sm text-gray-600">Due Date: {invoiceData.dueDate}</p>
          </div>
        </div>

        {/* Client Info */}
        <div className="mb-8">
          <h2 className="font-semibold mb-2">Bill To:</h2>
          <div className="text-sm text-gray-600">
            <p>{invoiceData.client.name}</p>
            <p>{invoiceData.client.address}</p>
            <p>{invoiceData.client.city}, {invoiceData.client.state} {invoiceData.client.zip}</p>
            <p>GSTIN: {invoiceData.client.gstin}</p>
            <p>Place of Supply: {invoiceData.client.placeOfSupply}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">HSN/SAC</th>
                <th className="px-4 py-2 text-right">Qty</th>
                <th className="px-4 py-2 text-right">Rate</th>
                <th className="px-4 py-2 text-right">GST%</th>
                <th className="px-4 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2">{item.description}</td>
                  <td className="px-4 py-2">{item.hsn}</td>
                  <td className="px-4 py-2 text-right">{item.qty}</td>
                  <td className="px-4 py-2 text-right">₹{item.rate.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">{item.gst}%</td>
                  <td className="px-4 py-2 text-right">₹{item.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-8 text-right">
          <p className="text-sm text-gray-600">
            Subtotal: ₹{subtotal.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            GST (18%): ₹{gst.toLocaleString()}
          </p>
          <p className="font-semibold text-lg border-t mt-2 pt-2">
            Total: ₹{total.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Amount in words: {numberToWords(total)}
          </p>
        </div>

        {/* Bank Details */}
       
        {/* Terms and Conditions */}
        <div className="mt-8 pt-8 border-t">
          <h3 className="font-semibold mb-2">Terms and Conditions:</h3>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            {invoiceData.terms.map((term, index) => (
              <li key={index}>{term}</li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
          <p>Thank you for your business!</p>
          <p>For any queries, please contact us at {invoiceData.company.email}</p>
        </div>
      </div>

      {/* Download Button */}
      <div className="text-center">
        <PDFDownloadLink
          document={<InvoicePDF />}
          fileName={`invoice-${invoiceData.number}.pdf`}
          className="inline-flex items-center gap-2 bg-[#1D3A76] text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {({ loading }) => (
            <>
              <FileText className="h-5 w-5" />
              {loading ? 'Generating PDF...' : 'Download PDF'}
            </>
          )}
        </PDFDownloadLink>
      </div>
    </div>
  );
};

export default Invoice;