import React, { createContext, useContext, ReactNode, useState } from 'react';

type CurrencyContextType = {
  selectedCurrency: string;
  selectedCurrencySymbol : string;
  updateCurrency: (currency: string) => void;
  convertPrice: (price: number) => number;
  reconvertPrice: (price: number, from : string) => number
  toString : (price : number) => string;
};

type CurrencyProviderProps = {
  children: ReactNode;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    return localStorage.getItem('selectedCurrency') || 'IDR';
  });

  const getCurrencySymbol = () => {
    const currencySymbols: { [key: string]: string } = {
      IDR: "Rp",
      USD: "$",
      EUR: "€",
    };
  
    return currencySymbols[selectedCurrency] || "";
  };


  const updateCurrency = (currency: string) => {
    localStorage.setItem('selectedCurrency',currency)
    setSelectedCurrency(currency);
  };

  const toString = (money: number): string => {
    const convertedData = convertPrice(money);
    
    if (selectedCurrency === "IDR") {
      return `${selectedCurrencySymbol} ${(convertedData)
        .toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } 
    else if (selectedCurrency === "USD") {
      return `${selectedCurrencySymbol} ${(convertedData).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    else if (selectedCurrency === "EUR") {
      return `${selectedCurrencySymbol} ${(convertedData).toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
  
    return `${selectedCurrencySymbol} ${convertedData.toFixed(2)}`;
  };
  
  
  const convertPrice = (price: number): number => {
    const baseConversionRate: { [key: string]: number } = {
      IDR: 1,
      USD: 0.000063,
      EUR: 0.00006,
    };
  
    // const fluctuationFactor = 0.01; // 1% fluctuation
  
    // const getRandomFluctuation = () => {
    //   const fluctuation = (Math.random() - 0.5) * 2 * fluctuationFactor;
    //   return 1 + fluctuation;
    // };
  
    // const conversionRate: { [key: string]: number } = {
    //   IDR: baseConversionRate.IDR * getRandomFluctuation(),
    //   USD: baseConversionRate.USD * getRandomFluctuation(),
    //   EUR: baseConversionRate.EUR * getRandomFluctuation(),
    // };
  
    return Number((price * baseConversionRate[selectedCurrency]).toFixed(2));
  };

  const reconvertPrice = (price : number, from : string) => {
    const baseConversionRate: { [key: string]: number } = {
      USD: 15873,
      EUR: 16667,
    };

    return price * baseConversionRate[from]
  }
  

  const selectedCurrencySymbol : string = getCurrencySymbol()

  const contextValue: CurrencyContextType = {selectedCurrency,selectedCurrencySymbol,updateCurrency,convertPrice,reconvertPrice,toString};

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
