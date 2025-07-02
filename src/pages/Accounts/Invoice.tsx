import { useEffect } from "react";
import { useLocation } from "react-router";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { Building2, FileText } from "lucide-react";
import companyLogo from "../../../public/images/logo.png";
import { numberToWords } from "../../utils/words";
const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  companyInfo: {
    flex: 1,
  },
  logo: {
    width: 100,
    height: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1D3A76",
  },
  subtitle: {
    fontSize: 10,
    color: "#4b5563",
    marginBottom: 4,
  },
  invoiceInfo: {
    alignItems: "flex-end",
  },
  invoiceDetails: {
    fontSize: 10,
    marginBottom: 4,
    color: "#1D3A76",
  },
  clientSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1f2937",
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    padding: 8,
  },
  description: { width: "20%", fontSize: 10 },
  status: { width: "20%", fontSize: 10 },
  gst: { width: "20%", fontSize: 10 },
  amount: { width: "20%", fontSize: 10 },
  mode: { width: "20%", fontSize: 10 },
  totalSection: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 4,
  },
  totalLabel: {
    width: 100,
    fontSize: 10,
    textAlign: "right",
    marginRight: 3,
  },
  totalAmount: {
    width: 100,
    fontSize: 10,
    textAlign: "right",
  },
  grandTotal: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  footer: {
    position: "absolute",
    bottom: 15,
    left: 30,
    right: 30,
  },
  footerText: {
    fontSize: 10,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 4,
  },
  paymentDetails: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
  paymentDetailsTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
  },
  paymentDetailsText: {
    fontSize: 10,
    color: "#4b5563",
    marginBottom: 4,
  },
  termsAndConditions: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
  termsTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
  },
  termsText: {
    fontSize: 10,
    color: "#4b5563",
    marginBottom: 4,
  },
});
const InvoicePDF = ({ subscription }: { subscription: Subscription }) => {
  const total = parseFloat(subscription.payment_amount);
  const invoiceData = {
    number: subscription.invoice_number || `INV-${subscription.id}`,
    date: subscription.created_at.split("T")[0],
    company: {
      name: "MEET OWNER",
      address:
        "401, 8-3-6-5/1/1/4, Astral Hasini Residency, J.P. Nagar, Yella Reddy Guda",
      city: "Hyderabad",
      state: "Telangana",
      zip: "500073",
      gstin: "36ABVFM6524D1ZZ",
      email: "support@meetowner.in",
      phone: "+91 9701888071",
    },
    client: {
      name: subscription.name,
      mobile: subscription.mobile,
      gstin: subscription.gst_number || "N/A",
      rerain: subscription.rera_number || "N/A",
    },
    items: [
      {
        description: subscription.subscription_package,
        status: subscription.payment_status,
        gst: subscription.gst_percentage,
        mode: subscription.payment_mode,
        amount: subscription.payment_amount,
      },
    ],
    gstDetails: {
      actualAmount: subscription.actual_amount,
      gstAmount: subscription.gst,
      sgstAmount: subscription.sgst,
      TotalAmount: subscription.payment_amount,
    },
    bankDetails: {
      paymentDate: subscription.transaction_time.split("T")[0],
      paymentPlatform: subscription.payment_gateway,
      startDate: subscription.subscription_start_date.split("T")[0],
      endDate: subscription.subscription_expiry_date.split("T")[0],
    },
    terms: [
      "Payment is due within 14 days",
      "Late payment may incur additional charges",
      "All prices are in Indian Rupees (INR)",
      "This is a computer-generated invoice, no signature required",
    ],
  };
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {}
        <View style={pdfStyles.header}>
          <View style={pdfStyles.companyInfo}>
            <Text style={pdfStyles.title}>TAX INVOICE</Text>
            <Image src={companyLogo} style={pdfStyles.logo} />
            <Text style={pdfStyles.subtitle}>{invoiceData.company.name}</Text>
            <Text style={pdfStyles.subtitle}>
              {invoiceData.company.address}
            </Text>
            <Text style={pdfStyles.subtitle}>
              {invoiceData.company.city}, {invoiceData.company.state}{" "}
              {invoiceData.company.zip}
            </Text>
            <Text style={pdfStyles.subtitle}>
              GSTIN: {invoiceData.company.gstin}
            </Text>
            <Text style={pdfStyles.subtitle}>
              Email: {invoiceData.company.email}
            </Text>
            <Text style={pdfStyles.subtitle}>
              Phone: {invoiceData.company.phone}
            </Text>
          </View>
          <View style={pdfStyles.invoiceInfo}>
            <Text style={pdfStyles.invoiceDetails}>
              Invoice: {invoiceData.number}
            </Text>
            <Text style={pdfStyles.invoiceDetails}>
              Date: {invoiceData.date}
            </Text>
          </View>
        </View>
        {}
        <View style={pdfStyles.clientSection}>
          <Text style={pdfStyles.sectionTitle}>Bill To:</Text>
          <Text style={pdfStyles.subtitle}>{invoiceData.client.name}</Text>
          <Text style={pdfStyles.subtitle}>
            Mobile: {invoiceData.client.mobile}
          </Text>
          <Text style={pdfStyles.subtitle}>
            GSTIN: {invoiceData.client.gstin}
          </Text>
          <Text style={pdfStyles.subtitle}>
            RERA Number: {invoiceData.client.rerain}
          </Text>
        </View>
        {}
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={pdfStyles.description}>Subscription</Text>
            <Text style={pdfStyles.status}>Status</Text>
            <Text style={pdfStyles.gst}>GST</Text>
            <Text style={pdfStyles.mode}>Mode</Text>
            <Text style={pdfStyles.amount}>Amount</Text>
          </View>
          {invoiceData.items.map((item, index) => (
            <View key={index} style={pdfStyles.tableRow}>
              <Text style={pdfStyles.description}>{item.description}</Text>
              <Text style={pdfStyles.status}>{item.status}</Text>
              <Text style={pdfStyles.gst}>{item.gst}%</Text>
              <Text style={pdfStyles.mode}>{item.mode}</Text>
              <Text style={pdfStyles.amount}>
                ₹{parseFloat(item.amount).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
        {}
        <View style={pdfStyles.totalSection}>
          <View style={pdfStyles.totalRow}>
            <Text style={pdfStyles.totalLabel}>Actual Amount:</Text>
            <Text style={pdfStyles.totalAmount}>
              ₹
              {parseFloat(invoiceData.gstDetails.actualAmount).toLocaleString()}
            </Text>
          </View>
          <View style={pdfStyles.totalRow}>
            <Text style={pdfStyles.totalLabel}>GST Amount:</Text>
            <Text style={pdfStyles.totalAmount}>
              ₹{parseFloat(invoiceData.gstDetails.gstAmount).toLocaleString()}
            </Text>
          </View>
          <View style={pdfStyles.totalRow}>
            <Text style={pdfStyles.totalLabel}>SGST Amount:</Text>
            <Text style={pdfStyles.totalAmount}>
              ₹{parseFloat(invoiceData.gstDetails.sgstAmount).toLocaleString()}
            </Text>
          </View>
          <View style={[pdfStyles.totalRow, pdfStyles.grandTotal]}>
            <Text style={pdfStyles.totalLabel}>Total:</Text>
            <Text style={pdfStyles.totalAmount}>
              ₹{parseFloat(invoiceData.gstDetails.TotalAmount).toLocaleString()}
            </Text>
          </View>
          <Text style={pdfStyles.subtitle}>
            Amount in words: {numberToWords(total)}
          </Text>
        </View>
        {}
        <View style={pdfStyles.paymentDetails}>
          <Text style={pdfStyles.paymentDetailsTitle}>Payment Details:</Text>
          <Text style={pdfStyles.paymentDetailsText}>
            Payment Date: {invoiceData.bankDetails.paymentDate}
          </Text>
          <Text style={pdfStyles.paymentDetailsText}>
            Platform: {invoiceData.bankDetails.paymentPlatform}
          </Text>
          <Text style={pdfStyles.paymentDetailsText}>
            Subscription Start Date: {invoiceData.bankDetails.startDate}
          </Text>
          <Text style={pdfStyles.paymentDetailsText}>
            Subscription End Date: {invoiceData.bankDetails.endDate}
          </Text>
        </View>
        {}
        <View style={pdfStyles.termsAndConditions}>
          <Text style={pdfStyles.termsTitle}>Terms and Conditions:</Text>
          {invoiceData.terms.map((term, index) => (
            <Text key={index} style={pdfStyles.termsText}>
              • {term}
            </Text>
          ))}
        </View>
        {}
        <View style={pdfStyles.footer}>
          <Text style={pdfStyles.footerText}>Thank you for your business!</Text>
          <Text style={pdfStyles.footerText}>
            For any queries, please contact us at {invoiceData.company.email}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
interface Subscription {
  id: number;
  user_id: number;
  name: string;
  mobile: string;
  email: string;
  subscription_package: string;
  subscription_start_date: string;
  subscription_expiry_date: string;
  subscription_status: string;
  payment_status: string;
  payment_amount: string;
  payment_reference: string;
  payment_mode: string;
  payment_gateway: string;
  transaction_time: string;
  created_at: string;
  updated_at: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  actual_amount: string;
  gst: string;
  sgst: string;
  gst_percentage: string;
  gst_number: string;
  rera_number: string;
  invoice_number: string | null;
}
const Invoice = () => {
  const location = useLocation();
  const subscription = location.state?.subscription as Subscription | undefined;
  if (!subscription) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="text-gray-600 mt-2">
          No subscription data available to generate the invoice.
        </p>
      </div>
    );
  }
  const subtotal = parseFloat(subscription.payment_amount);
  const invoiceData = {
    number: subscription.invoice_number || `INV-${subscription.id}`,
    date: subscription.created_at.split("T")[0],
    company: {
      name: "MEET OWNER",
      address:
        "401, 8-3-6-5/1/1/4,Astral Hasini Residency, J.P. Nagar, Yella Reddy Guda",
      city: "Hyderabad",
      state: "Telangana",
      zip: "500073",
      gstin: "36ABVFM6524D1ZZ",
      email: "support@meetowner.in",
      phone: "+91 9701888071",
    },
    client: {
      name: subscription.name,
      mobile: subscription.mobile,
      gstin: subscription.gst_number || "N/A",
      rerain: subscription.rera_number || "N/A",
    },
    items: [
      {
        description: subscription.subscription_package,
        status: subscription.payment_status,
        gst: subscription.gst_percentage,
        mode: subscription.payment_mode,
        amount: subscription.payment_amount,
      },
    ],
    gstDetails: {
      actualAmount: subscription.actual_amount,
      gstAmount: subscription.gst,
      sgstAmount: subscription.sgst,
      TotalAmount: subscription.payment_amount,
    },
    bankDetails: {
      paymentDate: subscription.transaction_time.split("T")[0],
      paymentPlatform: subscription.payment_gateway,
      startDate: subscription.subscription_start_date.split("T")[0],
      endDate: subscription.subscription_expiry_date.split("T")[0],
    },
    terms: [
      "Payment is due within 14 days",
      "Late payment may incur additional charges",
      "All prices are in Indian Rupees (INR)",
      "This is a computer-generated invoice, no signature required",
    ],
  };
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        {}
        <div className="flex justify-between items-start mb-8 pb-8 border-b">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-6 w-6 text-[#1D3A76]" />
              <h1 className="text-2xl font-bold text-[#1D3A76]">TAX INVOICE</h1>
            </div>
            <div className="text-sm text-gray-600">
              <img
                src={companyLogo}
                alt="Company Logo"
                className="w-24 h-12 mb-2 object-contain"
              />
              <p className="font-semibold">{invoiceData.company.name}</p>
              <p>{invoiceData.company.address}</p>
              <p>
                {invoiceData.company.city}, {invoiceData.company.state}{" "}
                {invoiceData.company.zip}
              </p>
              <p>GSTIN: {invoiceData.company.gstin}</p>
              <p>Email: {invoiceData.company.email}</p>
              <p>Phone: {invoiceData.company.phone}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-[#1D3A76]">
              Invoice :{invoiceData.number}
            </p>
            <p className="text-sm text-gray-600">Date: {invoiceData.date}</p>
          </div>
        </div>
        {}
        <div className="mb-8">
          <h2 className="font-semibold mb-2">Bill To:</h2>
          <div className="text-sm text-gray-600">
            <p>{invoiceData.client.name}</p>
            <p>Mobile :{invoiceData.client.mobile}</p>
            <p>GSTIN: {invoiceData.client.gstin}</p>
            <p>RERA Number : {invoiceData.client.rerain}</p>
          </div>
        </div>
        {}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Subscription</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-right">GST%</th>
                <th className="px-4 py-2 text-right">Mode</th>
                <th className="px-4 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2">{item.description}</td>
                  <td className="px-4 py-2">{item.status}</td>
                  <td className="px-4 py-2 text-right">{item.gst}%</td>
                  <td className="px-4 py-2 text-right">{item.mode}</td>
                  <td className="px-4 py-2 text-right">
                    ₹{item.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {}
        <div className="mt-8 text-right">
          <p className="text-sm text-gray-600">
            Actual Amount: ₹{invoiceData.gstDetails.actualAmount}
          </p>
          <p className="text-sm text-gray-600">
            GST Amount: ₹{invoiceData.gstDetails.gstAmount}
          </p>
          <p className="text-sm text-gray-600">
            SGST Amount: ₹{invoiceData.gstDetails.sgstAmount}
          </p>
          <p className="font-semibold text-lg border-t mt-2 pt-2">
            Total: ₹{invoiceData.gstDetails.TotalAmount}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Amount in words: {numberToWords(subtotal)}
          </p>
        </div>
        {}
        <div className="mt-8 pt-8 border-t">
          <h3 className="font-semibold mb-2">Payment Details:</h3>
          <div className="text-sm text-gray-600">
            <p>Payment Date: {invoiceData.bankDetails.paymentDate}</p>
            <p>PlatForm: {invoiceData.bankDetails.paymentPlatform}</p>
            <p>Subscription Start Date: {invoiceData.bankDetails.startDate}</p>
            <p>Subscription End Date: {invoiceData.bankDetails.endDate}</p>
          </div>
        </div>
        {}
        <div className="mt-8 pt-8 border-t">
          <h3 className="font-semibold mb-2">Terms and Conditions:</h3>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            {invoiceData.terms.map((term, index) => (
              <li key={index}>{term}</li>
            ))}
          </ul>
        </div>
        {}
        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
          <p>Thank you for your business!</p>
          <p>
            For any queries, please contact us at {invoiceData.company.email}
          </p>
        </div>
      </div>
      {}
      <div className="text-center">
        <PDFDownloadLink
          document={<InvoicePDF subscription={subscription} />}
          fileName={`invoice-${invoiceData.number}.pdf`}
          className="inline-flex items-center gap-2 bg-[#1D3A76] text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {({ loading }) => (
            <>
              <FileText className="h-5 w-5" />
              {loading ? "Generating PDF..." : "Download PDF"}
            </>
          )}
        </PDFDownloadLink>
      </div>
    </div>
  );
};
export { Invoice, InvoicePDF };
