import React, { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/tauri";

import Sidebar from './Sidebar';
import Network from './Network';
import Cpu from './Cpu';

interface TotalUsages {
  cpu: number | null;
  memory: number | null;
}


const Performance: React.FC = () => {


  return (
    <div>
    <Sidebar/>
    <Network/>
    </div>


  );

};

export default Performance;