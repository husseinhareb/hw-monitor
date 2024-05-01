import React from "react";

interface DisksProps{
    hidden: boolean;
}
const Disks: React.FC<DisksProps> = ({hidden}) => {
    return (
        <div style={{ display: hidden ? 'none' : 'block', width: '100%' }}>            Disks
        </div>
    );
}

export default Disks;
