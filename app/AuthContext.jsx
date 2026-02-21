import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Platform } from "react-native";

const AuthContext = createContext()

export const AuthProvider = ({children})=>{
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    
    const setAuth = authUser=>{
        setUser(authUser)
    }

    const setUserData = userData =>{
        setUser({...user, ...userData})
    }

    // Initialize auth state on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.user) {
                    setUser(session.user)
                }
            } catch (error) {
                console.error('Error initializing auth:', error)
            } finally {
                setIsLoading(false)
            }
        }

        initAuth()

        // Listen for auth state changes on all platforms
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user || null)
            }
        )
        return () => subscription?.unsubscribe()
    }, [])

    return (
        <AuthContext.Provider value={{user, setAuth, setUserData, isLoading}}>
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