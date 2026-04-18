import React from 'react';
import Sidebar from './Sidebar';
import useNetworkData from '../../hooks/Performance/useNetworkData';

const Performance: React.FC = () => {
  const { interfaceNames } = useNetworkData();

  return (
      <Sidebar 
      interfaceNames={interfaceNames} />
  );
};

export default Performance;
