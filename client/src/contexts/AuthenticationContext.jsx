import React, { createContext, useState, useEffect } from "react";

export const AuthenticationContext = createContext();

const AuthenticationContextProvider = (props) => {
    const [isAuthenticated, setIsAuthenticated] = useState("");

    useEffect(() => {
        const currentAuth = localStorage.getItem("isAuthenticated");

        if (currentAuth !== isAuthenticated) setIsAuthenticated(currentAuth);
    }, [isAuthenticated]);

    const handleAuthentication = (isAuthenticated) => {
        setIsAuthenticated(isAuthenticated);
        localStorage.setItem("isAuthenticated", isAuthenticated);
    };

    const handleLogOut = async () => {
        const API_URL =
            localStorage.getItem("isServiceProvider") === "true"
                ? "/servicelogout/"
                : "/logout/";

        const response = await fetch(API_URL, {
            method: "GET",
        });

        if (response.ok) {
            handleAuthentication("");
            localStorage.setItem("userID", "");
            localStorage.setItem("username", "");
            localStorage.setItem("isServiceProvider","");
            localStorage.setItem("phone_number", "");
            window.location.replace("/login");
        }
    };

    return (
        <AuthenticationContext.Provider
            value={{ isAuthenticated, handleAuthentication, handleLogOut }}
        >
            {props.children}
        </AuthenticationContext.Provider>
    );
};

export default AuthenticationContextProvider;
