import { localAxios } from "@/util/localAxiosUtil";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect, useState } from "react"

interface ApiContextType {
    data: any | null; // You can replace `any` with the specific type of the data you expect
    loading: boolean;
    error: string | null;
    reload: boolean,
    setReload: (value: boolean) => void
}

// Provide a default context value
const defaultApiContextValue: ApiContextType = {
    data: null,
    loading: true,
    error: null,
    reload: false,
    setReload: () => { }
};

// Create the context with a default value
const ApiContext = createContext<ApiContextType>(defaultApiContextValue);

const ApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const router = useRouter()
    const [data, setData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reload, setReload] = useState(true)


    const getUserDetails = async () => {
        await localAxios.get('/api/get-user-details')
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
                setLoading(false)
            })
    }

    useEffect(() => {
        if (reload) {
            getUserDetails()
            setReload(false)
        }
    }, [reload])


    return <ApiContext.Provider value={{ data, reload, loading, error, setReload }}>
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