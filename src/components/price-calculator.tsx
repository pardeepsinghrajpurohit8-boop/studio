
"use client";

import * as React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { ShoppingCart, DollarSign, Save, Trash2, History, Volume2, Loader } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { speakPrice } from "@/ai/flows/tts-flow";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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


export function PriceCalculator() {
  const [quantity, setQuantity] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [total, setTotal] = useState<number>(0);
  const [history, setHistory] = useState<Calculation[]>([]);
  const { toast } = useToast();
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const numQuantity = parseFloat(quantity);
    const numPrice = parseFloat(price);
    
    let newTotal = 0;
    if (!isNaN(numQuantity) && !isNaN(numPrice) && numQuantity >= 0 && numPrice >= 0) {
      newTotal = numQuantity * numPrice;
    }
    
    setTotal(newTotal);

    if (newTotal > 0) {
        handleSpeak(newTotal);
    }
    
  }, [quantity, price]);

  const handleSpeak = useCallback(async (amount: number) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
        const textToSpeak = `The total price is ${amount.toFixed(2)} rupees`;
        const result = await speakPrice(textToSpeak);
        if (result && result.media) {
            const audioObj = new Audio(result.media);
            setAudio(audioObj);
            audioObj.play();
            audioObj.onended = () => setIsSpeaking(false);
        } else {
            setIsSpeaking(false);
        }
    } catch (error) {
        console.error("Error generating speech:", error);
        setIsSpeaking(false);
    }
  }, [isSpeaking]);
  
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
      setHistory([newCalculation, ...history]);
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
    toast({
      title: "History Cleared",
    });
  }

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
          <div className={`text-center py-6 px-4 ${neumorphicTotalContainer} relative`}>
            <p className="text-base font-body text-muted-foreground uppercase tracking-widest">Total Price</p>
            <p 
              className="text-5xl font-bold font-headline text-primary tracking-tight transition-all duration-300 mt-2"
              aria-live="polite"
            >
              {formatCurrency(total)}
            </p>
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
          <CardTitle className="flex items-center gap-2 text-2xl font-headline text-foreground/90">
            <History className="h-7 w-7 text-primary" />
            Calculation History
          </CardTitle>
          <CardDescription>
            Your saved calculations appear here.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[450px] flex flex-col">
          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
              className="mb-4 self-start"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear History
            </Button>
          )}
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
