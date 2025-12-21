
"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { ShoppingCart, DollarSign, Save, Trash2, History, Volume2, Loader, Pencil, Package, Percent, FileDown, Printer, Share2, Eye } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { speakPrice } from "@/ai/flows/tts-flow";
import { numberToWords } from "@/ai/flows/number-to-words-flow";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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

    const subTotal = history.reduce((acc, calc) => acc + calc.total, 0);
    const gstAmount = subTotal * 0.025;
    const grandTotal = subTotal + gstAmount;

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
                    </style>
                `);
                printWindow.document.write('</head><body>');
                
                // Manually add the header to the print window
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
        ).join('\n');

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
GST: ${formatCurrency(gstAmount)}
*Grand Total: ${formatCurrency(grandTotal)}*
        `;

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(billText.trim())}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <>
            <div ref={billRef} className="text-sm">
                
                <div className="grid gap-2">
                    <p><strong>Bill Date:</strong> {new Date().toLocaleDateString()}</p>
                    <p><strong>Total Items:</strong> {history.length}</p>
                    <p><strong>Total Quantity:</strong> {totalQuantity}</p>
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
                            <TableCell colSpan={3} className="text-right font-bold">GST (2.5%)</TableCell>
                            <TableCell className="text-right font-bold">{formatCurrency(gstAmount)}</TableCell>
                        </TableRow>
                        <TableRow className="text-lg">
                            <TableCell colSpan={3} className="text-right font-bold">Grand Total</TableCell>
                            <TableCell className="text-right font-bold">{formatCurrency(grandTotal)}</TableCell>
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
  const [gst, setGst] = useState<number>(0);
  const [totalInWords, setTotalInWords] = useState<string>("");
  const [isConverting, setIsConverting] = useState(false);
  const [history, setHistory] = useState<Calculation[]>([]);
  const { toast } = useToast();
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const wordsDebounceTimeout = useRef<NodeJS.Timeout | null>(null);

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

  const handleSpeak = useCallback(async (amount: number) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
        const result = await numberToWords(amount);
        if (result && result.words) {
            const textToSpeak = `${result.words} rupees`;
            const audioResult = await speakPrice(textToSpeak);
            if (audioResult && audioResult.media) {
                const audioObj = new Audio(audioResult.media);
                setAudio(audioObj);
                audioObj.play();
                audioObj.onended = () => setIsSpeaking(false);
            } else {
                setIsSpeaking(false);
            }
        } else {
             setIsSpeaking(false);
        }
    } catch (error) {
        console.error("Error generating speech:", error);
        toast({
            variant: "destructive",
            title: "Speech Error",
            description: "Could not generate audio for the price.",
        });
        setIsSpeaking(false);
    }
  }, [isSpeaking, toast]);

  const convertToWords = useCallback(async (amount: number) => {
      if(amount <= 0) {
        setTotalInWords("");
        return;
      }
      setIsConverting(true);
      try {
        const result = await numberToWords(amount);
        if (result && result.words) {
          setTotalInWords(`${result.words} rupees`);
        }
      } catch (error) {
        console.error("Error converting number to words:", error);
        setTotalInWords("Could not convert to words.");
      } finally {
        setIsConverting(false);
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

    const gstValue = newTotal * 0.025;
    setGst(gstValue);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    if (wordsDebounceTimeout.current) clearTimeout(wordsDebounceTimeout.current);

    if (newTotal > 0) {
        debounceTimeout.current = setTimeout(() => {
            handleSpeak(newTotal);
        }, 1000); 

        wordsDebounceTimeout.current = setTimeout(() => {
            convertToWords(newTotal);
        }, 500);
    } else {
        setTotalInWords("");
    }

    return () => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        if (wordsDebounceTimeout.current) clearTimeout(wordsDebounceTimeout.current);
    }
    
  }, [quantity, price, handleSpeak, convertToWords]);
  
  const replayAudio = () => {
    if (audio) {
      audio.play();
    } else if (total > 0) {
      handleSpeak(total);
    }
  };


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
    if (history.length === 0) return;

    const subTotal = history.reduce((acc, calc) => acc + calc.total, 0);
    const gstAmount = subTotal * 0.025;
    const grandTotal = subTotal + gstAmount;

    const itemsText = history.map((item, index) => 
        `${index + 1}. Qty: ${item.quantity}, Rate: ${formatCurrency(item.price)}, Total: ${formatCurrency(item.total)}`
    ).join('\n');

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
GST: ${formatCurrency(gstAmount)}
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
              <div className="flex items-center justify-center gap-2 pt-2 text-foreground/80">
                <Percent className="h-4 w-4 text-primary"/>
                <span className="text-sm font-medium">GST (2.5%): <strong>{formatCurrency(gst)}</strong></span>
              </div>
            )}
            <div className="h-8">
                {total > 0 && (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Pencil className="h-4 w-4"/>
                        {isConverting ? (
                            <Skeleton className="h-4 w-48" />
                        ) : (
                            <span className="text-sm capitalize font-medium">{totalInWords || "..."}</span>
                        )}
                    </div>
                )}
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={replayAudio}
                className="absolute top-2 right-2 text-muted-foreground hover:text-primary"
                aria-label="Repeat price"
                disabled={isSpeaking || total === 0}
            >
                {isSpeaking ? <Loader className="animate-spin" /> : <Volume2 />}
            </Button>
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
                  {history.map((calc, index) => (
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

    