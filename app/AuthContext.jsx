import { createContext, useContext, useState } from "react";

const AuthContext = createContext()

export const AuthProvider = ({children})=>{
    const [user, setUser] = useState(null)
    const setAuth = authUser=>{
        setUser(authUser)
    }

    const setUserData = userData =>{
        setUser({...userData})
    }

    return (
        <AuthContext.Provider value={{user, setAuth, setUserData}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = ()=> useContext(AuthContext);

export default AuthProvider; on all platforms
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user || null)
            }
        )
        return () => subscription?.unsubscribe()