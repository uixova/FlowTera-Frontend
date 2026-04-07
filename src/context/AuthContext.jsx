import React, { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth'; 
import Loader from '../components/common/Loader';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const auth = useAuth();

    // Uygulama ilk açıldığında kullanıcı verisi çekilirken 
    // yarım yamalak ekran göstermemek için Loader basıyoruz.
    if (auth.loading) {
        return <Loader type="butterfly" />;
    }

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
};

// Sayfalarda kolayca kullanmak için custom context hook
// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};