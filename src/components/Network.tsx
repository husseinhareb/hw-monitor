import React from 'react';
import BiGraph from './Graph';
import useNetworkData from '../hooks/useNetworkData';

interface NetworkProps {
    hidden: boolean;
    interfaceName: string;
}

const Network: React.FC<NetworkProps> = ({ hidden, interfaceName }) => {
    const { download, upload, totalDownload, totalUpload } = useNetworkData(interfaceName);

    return (
        <div style={{ display: hidden ? 'none' : 'block', width: '100%' }}>
            <h2>{interfaceName}</h2>
            <BiGraph firstGraphValue={download} secondGraphValue={upload} />
            <p>Total Download: {totalDownload}</p>
            <p>Total Upload: {totalUpload}</p>
            <p>Download: {download.length > 0 ? download[download.length - 1] : 0}</p>
            <p>Upload: {upload.length > 0 ? upload[upload.length - 1] : 0}</p>
        </div>
    );
};

export default Network;
