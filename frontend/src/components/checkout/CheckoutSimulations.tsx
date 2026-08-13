import React from 'react';
import { Loader2, ShoppingBag, ShieldCheck, CheckCircle, Check, Download } from 'lucide-react';
import { CartItem } from '@/lib/context/AppContext';
import { jsPDF } from 'jspdf';

interface AddressData {
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface CheckoutSimulationsProps {
  checkoutStep: 'create_order' | 'payment_gateway' | 'payment_verification' | 'order_confirmed' | 'success';
  customerDetails: { name: string; phone: string; email: string };
  shippingAddress: AddressData;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'cod';
  deliveryMethod: 'standard' | 'express';
  cart: CartItem[];
  grandTotal: number;
  simulatedOrderId: string;
  creationStatus: string;
  verificationStatus: string;
  handleSimulatePayment: (success: boolean) => void;
  handleSuccessClose: () => void;
}

export default function CheckoutSimulations({
  checkoutStep,
  customerDetails,
  shippingAddress,
  paymentMethod,
  deliveryMethod,
  cart,
  grandTotal,
  simulatedOrderId,
  creationStatus,
  verificationStatus,
  handleSimulatePayment,
  handleSuccessClose
}: CheckoutSimulationsProps) {
  const codFee = paymentMethod === 'cod' ? 15 : 0;
  const finalTotal = grandTotal + codFee;

  const handleDownloadInvoice = () => {
    try {
      const doc = new jsPDF();
      
      // Set fonts & colors
      doc.setFont("helvetica", "bold");
      doc.setTextColor(56, 68, 1); // Accent Green (#384401)
      doc.setFontSize(22);
      doc.text("VILLAGE MADE", 20, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Authentic Village Crafts & Nutrition", 20, 25);
      
      // Invoice Title
      doc.setFontSize(24);
      doc.setTextColor(197, 108, 79); // Accent Orange (#C56C4F)
      doc.text("INVOICE", 150, 22);

      // Line separator
      doc.setDrawColor(56, 68, 1);
      doc.setLineWidth(0.5);
      doc.line(20, 32, 190, 32);

      // Details columns
      doc.setFont("helvetica", "bold");
      doc.setTextColor(62, 44, 28);
      doc.setFontSize(10);
      doc.text("Bill To:", 20, 42);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      doc.text(`${customerDetails.name}`, 20, 48);
      doc.text(`Phone: ${customerDetails.phone}`, 20, 54);
      doc.text(`Email: ${customerDetails.email || 'N/A'}`, 20, 60);
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(62, 44, 28);
      doc.text("Shipping Destination:", 20, 70);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      const splitAddress = doc.splitTextToSize(`${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.pincode}`, 80);
      doc.text(splitAddress, 20, 76);

      // Invoice Meta Right Column
      doc.setFont("helvetica", "bold");
      doc.setTextColor(62, 44, 28);
      doc.text("Invoice ID:", 120, 42);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      doc.text(`${simulatedOrderId || 'VM-DRAFT'}`, 150, 42);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(62, 44, 28);
      doc.text("Order Date:", 120, 48);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      doc.text(`${new Date().toLocaleDateString('en-IN')}`, 150, 48);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(62, 44, 28);
      doc.text("Payment Mode:", 120, 54);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      doc.text(`${paymentMethod ? paymentMethod.toUpperCase() : 'PAID'}`, 150, 54);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(62, 44, 28);
      doc.text("Delivery Type:", 120, 60);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      doc.text(`${deliveryMethod === 'express' ? 'Express Delivery' : 'Standard Delivery'}`, 150, 60);

      // Items table header
      let y = 100;
      doc.setFillColor(250, 244, 230); // #FAF4E6
      doc.rect(20, y, 170, 8, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(62, 44, 28);
      doc.text("Item Description", 22, y + 6);
      doc.text("Qty", 120, y + 6);
      doc.text("Price", 145, y + 6);
      doc.text("Total", 175, y + 6);

      doc.setDrawColor(238, 221, 185);
      doc.line(20, y + 8, 190, y + 8);
      
      y += 8;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);

      cart.forEach((item) => {
        y += 8;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(`${item.name} (${item.weight})`, 22, y);
        doc.text(`${item.quantity}`, 122, y);
        doc.text(`₹${item.price}`, 145, y);
        doc.text(`₹${item.price * item.quantity}`, 175, y);
        doc.line(20, y + 2, 190, y + 2);
      });

      // Totals
      y += 12;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(56, 68, 1);
      doc.text("Grand Total Paid:", 120, y);
      doc.text(`₹${finalTotal}`, 175, y);

      // Footer
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(8);
      doc.text("Thank you for supporting village industries and organic farming initiatives.", 105, 285, { align: "center" });

      doc.save(`invoice-${simulatedOrderId || 'VM'}.pdf`);
    } catch (e) {
      console.error('Failed to generate PDF invoice', e);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  switch (checkoutStep) {
    case 'create_order':
      return (
        <div className="min-h-[450px] flex flex-col justify-center items-center text-center max-w-xl mx-auto bg-white border border-[#eeddb9] rounded-[32px] p-8 md:p-12 shadow-md select-none animate-fade-in">
          <div className="relative mb-6">
            <Loader2 className="w-16 h-16 text-[#C56C4F] animate-spin" />
            <ShoppingBag className="w-7 h-7 text-[#384401] absolute top-4.5 left-4.5" />
          </div>
          <h2 className="text-2xl font-black font-jakarta text-stone-950 mb-3 tracking-tight">
            Creating Your Order
          </h2>
          <p className="text-stone-700 font-semibold text-sm max-w-sm mb-6 leading-relaxed">
            We are communicating with the village warehouses to secure allocation and setup draft details.
          </p>
          <div className="w-full bg-[#FAF4E6] border border-[#eeddb9] rounded-xl p-4 text-left font-jakarta text-sm text-[#3E2C1C] font-extrabold shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#384401] animate-ping" />
              <span>{creationStatus}</span>
            </div>
          </div>
        </div>
      );

    case 'payment_gateway':
      return (
        <div className="min-h-[420px] flex flex-col justify-center items-center text-center max-w-lg mx-auto bg-[#1a1008] border border-stone-800 rounded-[32px] p-6 sm:p-10 shadow-2xl text-white select-none animate-scale-up">
          {/* Header */}
          <div className="w-full flex justify-between items-center pb-4 border-b border-stone-800/80 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-green-500" />
              <span className="text-xs font-black text-stone-300 uppercase tracking-widest">VillagePay Gateway</span>
            </div>
            <span className="text-stone-400 text-xs font-mono font-bold">{simulatedOrderId}</span>
          </div>

          {/* Price Box */}
          <div className="w-full bg-stone-900 border border-stone-800 rounded-2xl p-5 mb-6 flex justify-between items-center text-left">
            <div>
              <span className="text-[10px] text-stone-400 block font-black uppercase tracking-wider mb-0.5">Payee Reference</span>
              <span className="text-sm font-bold text-stone-100 block">{customerDetails.name}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-400 block font-black uppercase tracking-wider mb-0.5">Amount Due</span>
              <span className="text-2xl font-black text-amber-400">₹{finalTotal}</span>
            </div>
          </div>

          {/* Payment Method Badge — clean, no details */}
          <div className="w-full bg-stone-900/60 border border-stone-800/50 rounded-xl px-5 py-4 mb-6 flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4.5 h-4.5 text-green-400" />
            </div>
            <div>
              <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mb-0.5">Payment Method</p>
              <p className="text-stone-100 font-extrabold text-sm uppercase tracking-wide">{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod.toUpperCase()}</p>
              <p className="text-stone-400 font-semibold text-xs mt-0.5">Click Authorize & Pay to confirm your order</p>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSimulatePayment(false)}
              className="py-3.5 bg-stone-900 hover:bg-stone-800 text-stone-300 font-black rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer border border-stone-800"
            >
              Cancel / Fail
            </button>
            <button
              onClick={() => handleSimulatePayment(true)}
              className="py-3.5 bg-[#C56C4F] hover:bg-[#a85237] text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg hover:shadow-xl font-jakarta"
            >
              Authorize &amp; Pay
            </button>
          </div>

          {/* Footer note */}
          <p className="text-xs text-stone-500 mt-5 leading-relaxed flex items-center gap-1.5 justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-green-500 shrink-0" /> Secured encryption protocol in sandbox environment.
          </p>
        </div>
      );

    case 'payment_verification':
      return (
        <div className="min-h-[450px] flex flex-col justify-center items-center text-center max-w-xl mx-auto bg-white border border-[#eeddb9] rounded-[32px] p-8 md:p-12 shadow-md select-none animate-fade-in">
          <div className="relative mb-6">
            <Loader2 className="w-16 h-16 text-[#384401] animate-spin" />
            <ShieldCheck className="w-7 h-7 text-green-600 absolute top-4.5 left-4.5 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black font-jakarta text-stone-950 mb-3 tracking-tight">
            Verifying Payment
          </h2>
          <p className="text-stone-700 font-semibold text-sm max-w-sm mb-6 leading-relaxed">
            We are communicating with the bank servers to secure authentication receipt.
          </p>
          <div className="w-full bg-[#FAF4E6] border border-[#eeddb9] rounded-xl p-4 text-left font-jakarta text-sm text-[#3E2C1C] font-extrabold shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#384401] animate-ping" />
              <span>{verificationStatus}</span>
            </div>
          </div>
        </div>
      );

    case 'order_confirmed':
      return (
        <div className="min-h-[450px] flex flex-col justify-center items-center text-center max-w-xl mx-auto bg-white border border-[#eeddb9] rounded-[32px] p-8 md:p-12 shadow-md select-none animate-scale-up">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-green-500/20 animate-ping duration-1000" />
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25">
              <Check className="w-9 h-9 text-white stroke-[3.5]" />
            </div>
          </div>
          <h1 className="font-display text-3xl font-black text-[#384401] mb-2 tracking-tight">
            Order Confirmed!
          </h1>
          <p className="text-[#C56C4F] font-black text-base mb-4 animate-pulse">
            Yay! Your request has been scheduled for dispatch.
          </p>
          <p className="text-stone-700 font-semibold text-sm max-w-xs leading-relaxed">
            Preparing invoice documents. This window will automatically forward to your order summary dashboard in just a moment...
          </p>
        </div>
      );

    case 'success':
      return (
        <div className="bg-[#FAF4E6] border border-[#eeddb9] rounded-[32px] p-6 md:p-12 max-w-2xl mx-auto shadow-md select-none animate-scale-up">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25 mx-auto">
              <Check className="w-9 h-9 text-white stroke-[3.5]" />
            </div>
          </div>
          <div className="text-center">
            <h1 className="font-display text-3xl font-black text-stone-950 mb-2">
              Pantry Order Dispatched!
            </h1>
            <p className="text-stone-800 font-extrabold text-sm mb-8">
              Thank you for supporting village industries and organic farming initiatives.
            </p>
          </div>

          {/* Receipt Summary Card */}
          <div className="bg-white border border-[#eeddb9] rounded-2xl p-6 mb-8 text-left text-sm font-jakarta text-stone-800 flex flex-col gap-4 shadow-sm">
            <div className="flex justify-between border-b border-stone-150 pb-3 mb-1">
              <div>
                <span className="font-black text-stone-950 text-sm block">Order Reference ID:</span>
                <span className="text-[#384401] font-mono text-xs font-bold block mt-1">{simulatedOrderId || 'VM-395802'}</span>
              </div>
              <div className="text-right">
                <span className="text-[#C56C4F] font-black text-xs block">Estimated Delivery</span>
                <span className="text-stone-950 block font-black mt-1 text-sm">
                  {deliveryMethod === 'express' ? '1 - 2 business days' : '3 - 5 business days'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-b border-stone-150 pb-3 font-semibold text-stone-805">
              <p><strong>Deliver To:</strong> {customerDetails.name} ({customerDetails.phone})</p>
              <p><strong>Shipment Address:</strong> {shippingAddress.address}, {shippingAddress.city}, {shippingAddress.pincode}</p>
              <p><strong>Payment Mode:</strong> <span className="uppercase text-[#384401] font-extrabold">{paymentMethod}</span></p>
            </div>

            {/* Items List */}
            <div className="flex flex-col gap-2 border-b border-stone-150 pb-3">
              <span className="font-black text-stone-950 block mb-1">Items Dispatched:</span>
              {cart.map((item) => (
                <div key={`${item.id}-${item.weight}`} className="flex justify-between items-center text-sm font-semibold text-stone-750">
                  <span>{item.name} ({item.weight}) x {item.quantity}</span>
                  <span className="font-extrabold text-stone-950">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-black text-stone-950 pt-1 text-base">
              <span>Grand Total Authorized:</span>
              <span className="text-lg text-[#384401]">₹{finalTotal}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={handleSuccessClose}
              className="w-full sm:w-auto bg-[#384401] hover:bg-[#252d00] text-white font-black py-4.5 px-10 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-xs uppercase tracking-wider text-center"
            >
              Explore More Products
            </button>
            <button
              onClick={handleDownloadInvoice}
              className="w-full sm:w-auto bg-[#C56C4F] hover:bg-[#a85237] text-white font-black py-4.5 px-10 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 font-jakarta"
            >
              <Download className="w-4 h-4" /> Download Invoice (PDF)
            </button>
          </div>
        </div>
      );

    default:
      return null;
  }
}
