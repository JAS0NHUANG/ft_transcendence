import axios from "axios";
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute: React.FC<{ component: React.ReactElement }> = ({ component }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/user/me`,
                    { withCredentials: true }
                );
                console.log(response.data.userName);
                setIsLoggedIn(true);
            } catch (error) {
                console.log(error);
                setIsLoggedIn(false);
            }
        };

        checkLoggedIn();
    }, []); // Empty dependency array ensures that the effect runs once after the initial render

    if (isLoggedIn === null) {
        // Loading state while checking authentication
        return <div>Loading...</div>;
    }

    return isLoggedIn ? component : <Navigate to="/auth" />;
};

export default PrivateRoute;
