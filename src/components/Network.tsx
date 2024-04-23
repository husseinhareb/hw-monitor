import React, { useEffect, useState } from 'react';
import { invoke } from "@tauri-apps/api/tauri";

interface Network {
    interface: string;
    download: number | null;
    upload: number | null;
}


const Network: React.FC = () => {
    const [network, setNetwork] = useState<Network[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Networks
                const fetchedNetworks: Network[] = await invoke("get_network");
                setNetwork(fetchedNetworks);
                console.log(fetchedNetworks)

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 1000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div>
            Wi-Fi
        </div>
    );
}

export default Network;
