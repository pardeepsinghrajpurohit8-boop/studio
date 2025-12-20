"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Calculator, ShoppingCart, DollarSign } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function PriceCalculator() {
  const [quantity, setQuantity] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const numQuantity = parseFloat(quantity);
    const numPrice = parseFloat(price);
    
    if (!isNaN(numQuantity) && !isNaN(numPrice) && numQuantity >= 0 && numPrice >= 0) {
      setTotal(numQuantity * numPrice);
    } else {
      setTotal(0);
    }
  }, [quantity, price]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };
  
  const formatCurrency = (value: number) => {
    if(isNaN(value)) return '$0.00';
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
  
  // Neumorphic styles are designed for a light background like #E0E0E0
  const darkShadow = "#bebebe";
  const lightShadow = "#ffffff";
  const neumorphicCardStyle = `bg-background border-none shadow-[10px_10px_20px_${darkShadow},-10px_-10px_20px_${lightShadow}]`;
  const neumorphicInputStyle = `bg-transparent border-none text-foreground placeholder:text-muted-foreground shadow-[inset_5px_5px_10px_${darkShadow},_inset_-5px_-5px_10px_${lightShadow}] focus-visible:ring-accent focus-visible:ring-2 focus-visible:ring-offset-0 transition-all duration-300`;
  const neumorphicIconContainer = `bg-background rounded-full shadow-[inset_5px_5px_10px_${darkShadow},_inset_-5px_-5px_10px_${lightShadow}]`;
  const neumorphicTotalContainer = `bg-background rounded-xl shadow-[inset_8px_8px_16px_${darkShadow},_inset_-8px_-8px_16px_${lightShadow}]`;

  return (
    <Card className={`w-full max-w-md ${neumorphicCardStyle} rounded-3xl`}>
      <CardHeader className="items-center text-center pt-8">
        <div className={`p-4 ${neumorphicIconContainer}`}>
           <Calculator className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="font-headline text-3xl mt-4 text-foreground/90">CalcPrice</CardTitle>
        <CardDescription className="font-body text-muted-foreground">
          Your futuristic price calculator
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 p-6 sm:p-8">
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
                <DollarSign className="h-5 w-5 text-primary" />
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
        <div className={`text-center py-6 px-4 ${neumorphicTotalContainer}`}>
          <p className="text-base font-body text-muted-foreground uppercase tracking-widest">Total Price</p>
          <p 
            className="text-5xl font-bold font-headline text-primary tracking-tight transition-all duration-300 mt-2"
            aria-live="polite"
          >
            {formatCurrency(total)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
