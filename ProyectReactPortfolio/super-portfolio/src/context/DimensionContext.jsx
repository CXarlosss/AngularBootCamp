import React, { createContext, useContext, useState, useEffect } from "react";

const DimensionContext = createContext();

export const useDimension = () => useContext(DimensionContext);

export const DimensionProvider = ({ children }) => {
    // Default to 'standard' (the professional core)
    const [dimension, setDimension] = useState(localStorage.getItem("activeDimension") || "standard");

    useEffect(() => {
        localStorage.setItem("activeDimension", dimension);
        // Applying dimension class to body for global styling effects if needed
        document.body.className = `dimension-${dimension}`;
    }, [dimension]);

    const changeDimension = (newDim) => {
        setDimension(newDim);
    };

    return (
        <DimensionContext.Provider value={{ dimension, changeDimension }}>
            <div className={`universe-wrapper dimension-${dimension}`}>
                {children}
            </div>
        </DimensionContext.Provider>
    );
};
