import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect, useState } from "react"

interface ApiContextType {
    data: any | null; // You can replace `any` with the specific type of the data you expect
    loading: boolean;
    error: string | null;
}

// Provide a default context value
const defaultApiContextValue: ApiContextType = {
    data: null,
    loading: true,
    error: null,
};

// Create the context with a default value
const ApiContext = createContext<ApiContextType>(defaultApiContextValue);

const ApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const router = useRouter()
    const [data, setData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    const getUserDetails = async () => {
        await axios.get('/api/get-user-details')
            .then(response => {
                setData(response.data)
            })
            .catch((e) => {
                const errorMessages = e.response.data.error
                if (errorMessages) {
                    if (errorMessages['Unauthorized']) {
                        router.push('/login')
                    }
                }

            })
            .finally(() => {
            })
    }

    useEffect(() => {
        getUserDetails()
    }, [])


    return <ApiContext.Provider value={{ data, loading, error }}>
        {children}
    </ApiContext.Provider>
}

const useApiData = () => {
    return useContext(ApiContext)
}


export {
    useApiData,
    ApiProvider
} 