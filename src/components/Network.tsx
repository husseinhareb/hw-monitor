import React, { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/tauri";

import BiGraph from './BiGraph';

interface NetworkUsages {
  download: number | null;
  upload: number | null;
}

const Performance: React.FC = () => {

  const [networkUsages, setNetworkUsages] = useState<NetworkUsages>({ download: null, upload: null });
  const [download, setDownload] = useState<number[]>([]);
  const [upload, setupload] = useState<number[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedNetworkUsages: NetworkUsages = await invoke("get_network");
        setNetworkUsages(fetchedNetworkUsages);
      } catch (error) {
        console.error("Error fetching data:", error);
      }

    };

    fetchData();
    const intervalId = setInterval(fetchData, 1000);

    return () => clearInterval(intervalId);
  }, []);




  useEffect(() => {
    if (networkUsages.download !== null) {
      setDownload(prevDownload => {
        const newDownload = [...prevDownload, networkUsages.download as number];
        return newDownload;
      });
    }
    if (networkUsages.upload !== null) {
      setupload(prevupload => [...prevupload, networkUsages.upload as number]);
    }
  }, [networkUsages]);







  return (
    <BiGraph firstGraphValue={download} secondGraphValue={upload}/>
  );

};

export default Performance;