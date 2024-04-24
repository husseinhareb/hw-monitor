import React from 'react';

import NetworkGraph from './NetworkGraph';

interface NetworkProps {
    download: number[];
    upload: number[];
}
const Network: React.FC<NetworkProps> = ({download,upload}) => {
  
    return (
        <div>
            <NetworkGraph download={download} upload={upload} />
        </div>
    );
};

export default Network;
