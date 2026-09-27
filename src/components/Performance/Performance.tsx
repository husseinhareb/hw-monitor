import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import useNetworkData from '../../hooks/Performance/useNetworkData';
import { useResetHistories } from '../../services/store';

const Performance: React.FC = () => {
  const { interfaceNames } = useNetworkData();
  const resetHistories = useResetHistories();

  // Sampling stops while another page is shown; start a fresh timeline on return instead of
  // joining old and new samples with the gap hidden
  useEffect(() => resetHistories, [resetHistories]);

  return (
      <Sidebar 
      interfaceNames={interfaceNames} />
  );
};

export default Performance;
