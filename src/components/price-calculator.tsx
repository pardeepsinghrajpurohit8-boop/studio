
"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { ShoppingCart, DollarSign, Save, Trash2, History, Package, Percent, Share2, Printer, Eye } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";


interface Calculation {
  id: string;
  quantity: number;
  price: number;
  total: number;
}

const JeansIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 3v3" />
      <path d="M12 9v12" />
      <path d="M15 3.5c0 .8-.7 1.5-1.5 1.5h-3A1.5 1.5 0 0 1 9 3.5" />
      <path d="M15 21c0-1.7-1.3-3-3-3s-3 1.3-3 3" />
      <path d="M9 9H5.5a2.5 2.5 0 0 0 0 5H9" />
      <path d="M15 9h3.5a2.5 2.5 0 1 1 0 5H15" />
    </svg>
);

const BillContent = ({ history, totalQuantity, formatCurrency }: { history: Calculation[], totalQuantity: number, formatCurrency: (value: number) => string }) => {
    const billRef = useRef<HTMLDivElement>(null);
    const [cashPaid, setCashPaid] = useState("");
    const [accountPaid, setAccountPaid] = useState("");
    const [dues, setDues] = useState("");
    const [partyName, setPartyName] = useState("");
    const [partyPhone, setPartyPhone] = useState("");
    const [gstNumber, setGstNumber] = useState("");
    const [aadharNumber, setAadharNumber] = useState("");

    const subTotal = history.reduce((acc, calc) => acc + calc.total, 0);
    const cgstAmount = subTotal * 0.025;
    const sgstAmount = subTotal * 0.025;
    const grandTotal = subTotal + cgstAmount + sgstAmount;

    const numCashPaid = parseFloat(cashPaid) || 0;
    const numAccountPaid = parseFloat(accountPaid) || 0;
    
    const remainingBalance = grandTotal - numCashPaid - numAccountPaid;

    const handlePrint = () => {
        const printContent = billRef.current;
        if (printContent) {
            const printWindow = window.open('', '', 'height=800,width=800');
            if (printWindow) {
                printWindow.document.write('<html><head><title>Bill - MATESHWARI EXPORTS</title>');
                printWindow.document.write(`
                    <style>
                        @media print {
                          @page { size: auto; margin: 0.5in; }
                        }
                        body { font-family: sans-serif; margin: 20px; }
                        .bill-header { text-align: center; margin-bottom: 2rem; }
                        .bill-title { font-size: 2.5rem; font-weight: bold; margin: 0; color: red; }
                        .bill-subtitle { font-size: 1rem; color: #333; margin-top: 4px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 1rem;}
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        .text-right { text-align: right; }
                        .font-bold { font-weight: bold; }
                        .text-green-600 { color: green; }
                        .text-red-600 { color: red; }
                        .grid-container { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                        .party-details, .bill-details { display: flex; flex-direction: column; gap: 0.5rem; }
                    </style>
                `);
                printWindow.document.write('</head><body>');
                
                printWindow.document.write(`
                    <div class="bill-header">
                        <div class="bill-title">MATESHWARI EXPORTS</div>
                        <div class="bill-subtitle">Mfrs. & Wholesale : All types of Jeans & Cotton Pant</div>
                    </div>
                `);

                printWindow.document.write(printContent.innerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
            }
        }
    };
    
    const handleShareOnWhatsApp = () => {
        const itemsText = history.map((item, index) => 
            `${index + 1}. Qty: ${item.quantity}, Rate: ${formatCurrency(item.price)}, Total: ${formatCurrency(item.total)}`
        ).join('\\n');

        const billText = `
*MATESHWARI EXPORTS*
Mfrs. & Wholesale : All types of Jeans & Cotton Pant
-----------------------------------
*Bill Details*
Bill Date: ${new Date().toLocaleDateString()}
Total Items: ${history.length}
Total Quantity: ${totalQuantity}
${partyName ? `Party Name: ${partyName}` : ''}
${partyPhone ? `Party Phone: ${partyPhone}` : ''}
${gstNumber ? `GST No: ${gstNumber}` : ''}
${aadharNumber ? `Aadhar No: ${aadharNumber}` : ''}
-----------------------------------
*Items*
${itemsText}
-----------------------------------
*Summary*
Subtotal: ${formatCurrency(subTotal)}
CGST (2.5%): ${formatCurrency(cgstAmount)}
SGST (2.5%): ${formatCurrency(sgstAmount)}
*Grand Total: ${formatCurrency(grandTotal)}*
-----------------------------------
Cash Payment: ${cashPaid ? formatCurrency(parseFloat(cashPaid)) : 'No Cash Entry'}
Account Transaction: ${accountPaid ? formatCurrency(parseFloat(accountPaid)) : 'No Account Entry'}
Dues: ${dues ? formatCurrency(parseFloat(dues)) : 'N/A'}
Remaining Balance: ${formatCurrency(remainingBalance)}
        `;

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(billText.trim())}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <>
            <div ref={billRef} className="text-sm">
                
                <div className="grid grid-cols-2 gap-8 mb-4">
                    <div className="grid gap-2">
                         <p><strong>Bill Date:</strong> {new Date().toLocaleDateString()}</p>
                         <p><strong>Total Items:</strong> {history.length}</p>
                         <p><strong>Total Quantity:</strong> {totalQuantity}</p>
                    </div>
                     <div className="grid gap-2">
                        <Input type="text" placeholder="Party Name" value={partyName} onChange={e => setPartyName(e.target.value)} className="h-8 text-sm" />
                        <Input type="text" placeholder="Party Phone Number" value={partyPhone} onChange={e => setPartyPhone(e.target.value)} className="h-8 text-sm" />
                        <Input type="text" placeholder="GST Number" value={gstNumber} onChange={e => setGstNumber(e.target.value)} className="h-8 text-sm" />
                        <Input type="text" placeholder="Aadhar Number" value={aadharNumber} onChange={e => setAadharNumber(e.target.value)} className="h-8 text-sm" />
                    </div>
                </div>

                <Separator className="my-4" />
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Rate</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {history.map((item, index) => (
                            <TableRow key={item.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{formatCurrency(item.price)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={3} className="text-right font-bold">Subtotal</TableCell>
                            <TableCell className="text-right font-bold">{formatCurrency(subTotal)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={3} className="text-right font-bold">CGST (2.5%)</TableCell>
                            <TableCell className="text-right font-bold">{formatCurrency(cgstAmount)}</TableCell>
                        </TableRow>
                         <TableRow>
                            <TableCell colSpan={3} className="text-right font-bold">SGST (2.5%)</TableCell>
                            <TableCell className="text-right font-bold">{formatCurrency(sgstAmount)}</TableCell>
                        </TableRow>
                        <TableRow className="text-lg">
                            <TableCell colSpan={3} className="text-right font-bold">Grand Total</TableCell>
                            <TableCell className="text-right font-bold">{formatCurrency(grandTotal)}</TableCell>
                        </TableRow>
                        <TableRow>
                             <TableCell colSpan={3} className="text-right font-bold">Cash Payment</TableCell>
                             <TableCell className="text-right">
                                 <Input type="number" placeholder="No Cash Entry" value={cashPaid} onChange={e => setCashPaid(e.target.value)} className="text-right h-8" />
                             </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={3} className="text-right font-bold">Account Transaction</TableCell>
                            <TableCell className="text-right">
                                <Input type="number" placeholder="No Account Entry" value={accountPaid} onChange={e => setAccountPaid(e.target.value)} className="text-right h-8" />
                            </TableCell>
                        </TableRow>
                         <TableRow>
                            <TableCell colSpan={3} className="text-right font-bold text-red-600">Dues (बाकि)</TableCell>
                             <TableCell className="text-right">
                                <Input type="number" placeholder="Enter Dues" value={dues} onChange={e => setDues(e.target.value)} className="text-right h-8 text-red-600 font-bold" />
                             </TableCell>
                        </TableRow>
                         <TableRow className="text-lg">
                            <TableCell colSpan={3} className="text-right font-bold">Remaining Balance</TableCell>
                             <TableCell className={`text-right font-bold ${remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                 {formatCurrency(remainingBalance)}
                             </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
            <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
                <Button onClick={handlePrint} className="w-full sm:w-auto">
                    <Printer className="mr-2 h-4 w-4" />
                    Print / Download PDF
                </Button>
                 <Button onClick={handleShareOnWhatsApp} className="w-full sm:w-auto" variant="secondary">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share on WhatsApp
                </Button>
            </DialogFooter>
        </>
    );
};


export function PriceCalculator() {
  const [quantity, setQuantity] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [total, setTotal] = useState<number>(0);
  const [cgst, setCgst] = useState<number>(0);
  const [sgst, setSgst] = useState<number>(0);
  const [history, setHistory] = useState<Calculation[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    // Load history from localStorage on component mount
    try {
      const savedHistory = localStorage.getItem("calcHistory");
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
    }
  }, []);


  useEffect(() => {
    const numQuantity = parseFloat(quantity);
    const numPrice = parseFloat(price);
    
    let newTotal = 0;
    if (!isNaN(numQuantity) && !isNaN(numPrice) && numQuantity >= 0 && numPrice >= 0) {
      newTotal = numQuantity * numPrice;
    }
    
    setTotal(newTotal);

    const cgstValue = newTotal * 0.025;
    const sgstValue = newTotal * 0.025;
    setCgst(cgstValue);
    setSgst(sgstValue);
    
  }, [quantity, price]);
  

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };
  
  const formatCurrency = (value: number) => {
    if(isNaN(value)) return '₹0.00';
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleSave = () => {
    const numQuantity = parseFloat(quantity);
    const numPrice = parseFloat(price);

    if (total > 0 && !isNaN(numQuantity) && !isNaN(numPrice)) {
      const newCalculation: Calculation = {
        id: new Date().toISOString(),
        quantity: numQuantity,
        price: numPrice,
        total: total,
      };
      const updatedHistory = [newCalculation, ...history];
      setHistory(updatedHistory);
      try {
        localStorage.setItem("calcHistory", JSON.stringify(updatedHistory));
      } catch (error) {
        console.error("Failed to save history to localStorage", error);
      }
      
      toast({
        title: "Calculation Saved",
        description: `Saved: ${numQuantity} x ${formatCurrency(numPrice)} = ${formatCurrency(total)}`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Cannot Save",
        description: "Please enter valid quantity and price before saving.",
      });
    }
  };
  
  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("calcHistory");
    } catch (error) {
      console.error("Failed to clear history from localStorage", error);
    }
    toast({
      title: "History Cleared",
    });
  }

  const handleShareBill = () => {
    if (history.length === 0) {
        toast({
            variant: "destructive",
            title: "Cannot Share Bill",
            description: "There are no calculations in the history to share.",
        });
        return;
    }

    const subTotal = history.reduce((acc, calc) => acc + calc.total, 0);
    const cgstAmount = subTotal * 0.025;
    const sgstAmount = subTotal * 0.025;
    const grandTotal = subTotal + cgstAmount + sgstAmount;

    const itemsText = history.map((item, index) => 
        `${index + 1}. Qty: ${item.quantity}, Rate: ${formatCurrency(item.price)}, Total: ${formatCurrency(item.total)}`
    ).join('\\n');

    const billText = `
*MATESHWARI EXPORTS*
Mfrs. & Wholesale : All types of Jeans & Cotton Pant
-----------------------------------
*Bill Details*
Bill Date: ${new Date().toLocaleDateString()}
Total Items: ${history.length}
Total Quantity: ${totalQuantity}
-----------------------------------
*Items*
${itemsText}
-----------------------------------
*Summary*
Subtotal: ${formatCurrency(subTotal)}
CGST (2.5%): ${formatCurrency(cgstAmount)}
SGST (2.5%): ${formatCurrency(sgstAmount)}
*Grand Total: ${formatCurrency(grandTotal)}*
    `;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(billText.trim())}`;
    window.open(whatsappUrl, '_blank');
  };

  const totalQuantity = history.reduce((acc, calc) => acc + (calc.quantity || 0), 0);

  // Neumorphic styles
  const darkShadow = "#bebebe";
  const lightShadow = "#ffffff";
  const neumorphicCardStyle = `bg-background border-none shadow-[10px_10px_20px_${darkShadow},-10px_-10px_20px_${lightShadow}]`;
  const neumorphicInputStyle = `bg-transparent border-none text-foreground placeholder:text-muted-foreground shadow-[inset_5px_5px_10px_${darkShadow},_inset_-5px_-5px_10px_${lightShadow}] focus-visible:ring-accent focus-visible:ring-2 focus-visible:ring-offset-0 transition-all duration-300`;
  const neumorphicIconContainer = `bg-background rounded-full shadow-[inset_5px_5px_10px_${darkShadow},_inset_-5px_-5px_10px_${lightShadow}]`;
  const neumorphicTotalContainer = `bg-background rounded-xl shadow-[inset_8px_8px_16px_${darkShadow},_inset_-8px_-8px_16px_${lightShadow}]`;
  
  return (
    <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-8">
      <Card className={`w-full lg:max-w-md ${neumorphicCardStyle} rounded-3xl`}>
        <CardHeader className="items-center text-center pt-8">
          <div className={`p-4 ${neumorphicIconContainer}`}>
             <DollarSign className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl mt-4 text-foreground/90">Price Calculator</CardTitle>
          <CardDescription className="font-body text-muted-foreground">
            Your futuristic price calculator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="space-y-6">
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="quantity" className="font-semibold text-base flex items-center gap-2 text-foreground/80">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                placeholder="e.g., 5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onFocus={handleFocus}
                className={`h-14 text-lg ${neumorphicInputStyle}`}
                aria-label="Item Quantity"
              />
            </div>
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="price" className="font-semibold text-base flex items-center gap-2 text-foreground/80">
                  <JeansIcon className="h-5 w-5 text-primary" />
                  Rate (Price per item)
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 10.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onFocus={handleFocus}
                className={`h-14 text-lg ${neumorphicInputStyle}`}
                aria-label="Item Price"
              />
            </div>
          </div>
          <div className={`text-center py-6 px-4 ${neumorphicTotalContainer} relative space-y-2`}>
            <div>
              <p className="text-base font-body text-muted-foreground uppercase tracking-widest">Total Price</p>
              <p 
                className="text-5xl font-bold font-headline text-primary tracking-tight transition-all duration-300 mt-2"
                aria-live="polite"
              >
                {formatCurrency(total)}
              </p>
            </div>
             {total > 0 && (
              <div className="grid grid-cols-2 items-center justify-center gap-x-4 gap-y-1 pt-2 text-foreground/80 text-xs">
                <div className="flex items-center justify-end gap-1">
                  <Percent className="h-3 w-3 text-primary"/>
                  <span className="font-medium">CGST (2.5%):</span>
                </div>
                <strong className="text-left">{formatCurrency(cgst)}</strong>
                <div className="flex items-center justify-end gap-1">
                   <Percent className="h-3 w-3 text-primary"/>
                   <span className="font-medium">SGST (2.5%):</span>
                </div>
                 <strong className="text-left">{formatCurrency(sgst)}</strong>
              </div>
            )}
            <div className="h-8 pt-2">
            </div>
          </div>
          <Button onClick={handleSave} size="lg" className="w-full h-14 text-lg font-bold">
            <Save className="mr-2 h-5 w-5"/>
            Save Calculation
          </Button>
        </CardContent>
      </Card>
      
      <Card className={`w-full flex-1 ${neumorphicCardStyle} rounded-3xl`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-2xl font-headline text-foreground/90">
              <History className="h-7 w-7 text-primary" />
              Calculation History
            </CardTitle>
            {history.length > 0 && (
              <div className="text-right flex items-center gap-2">
                 <div className={`p-2 ${neumorphicIconContainer}`}>
                  <Package className="h-6 w-6 text-primary"/>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Quantity</p>
                  <p className="text-xl font-bold text-foreground/90">{totalQuantity}</p>
                </div>
              </div>
            )}
          </div>
          <CardDescription>
            Your saved calculations appear here.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[450px] flex flex-col">
           <div className="flex justify-between items-center mb-4">
              {history.length > 0 && (
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearHistory}
                      className="self-start"
                  >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear History
                  </Button>
              )}
              {history.length > 0 && (
                <div className="flex gap-2">
                  <Dialog>
                      <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              Preview Bill
                          </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl">
                          <DialogHeader>
                              <DialogTitle className="text-red-500 text-2xl font-bold">MATESHWARI EXPORTS</DialogTitle>
                              <DialogDescription>
                                  Mfrs. & Wholesale : All types of Jeans & Cotton Pant
                              </DialogDescription>
                          </DialogHeader>
                          <BillContent history={history} totalQuantity={totalQuantity} formatCurrency={formatCurrency} />
                      </DialogContent>
                  </Dialog>
                  <Button onClick={handleShareBill} size="sm">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Bill on WhatsApp
                  </Button>
                </div>
              )}
          </div>

          <Separator className="mb-4" />
          <ScrollArea className="flex-1 pr-4 -mr-4">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                 <div className={`p-4 mb-4 ${neumorphicIconContainer}`}>
                  <History className="h-12 w-12 text-muted-foreground/50"/>
                </div>
                <p className="font-semibold">No Saved Data</p>
                <p className="text-sm">Your saved calculations will be shown here.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                <AnimatePresence>
                  {history.map((calc) => (
                    <motion.li
                      key={calc.id}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                      className={`p-4 rounded-xl ${neumorphicTotalContainer}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {calc.quantity} x {formatCurrency(calc.price)}
                          </p>
                           <p className="text-2xl font-bold text-primary">
                            {formatCurrency(calc.total)}
                          </p>
                        </div>
                         <p className="text-xs text-muted-foreground">
                          {new Date(calc.id).toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

    