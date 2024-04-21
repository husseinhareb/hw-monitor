import React, { useState ,useEffect} from 'react';
import { List, ListItem, SidebarContainer, Title } from '../styled-components/sidebar-style';
import { invoke } from "@tauri-apps/api/tauri";

function Sidebar() {
  const [activeItem, setActiveItem] = useState("CPU");
  const [totalUsages, setTotalUsages] = useState([]);
  const [error, setError] = useState(null);

  const handleItemClick = (itemName) => {
    setActiveItem(itemName);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch total usages
        const fetchedTotalUsages = await invoke("get_total_usages");
        setTotalUsages(fetchedTotalUsages);
        console.log(fetchedTotalUsages)

      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error: Failed to fetch data");
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 1000);

    return () => clearInterval(intervalId);
  },[]);


  const renderComponent = () => {
    switch (activeItem) {
      case 'CPU':
        return (
          <div>
            {/* CPU component content */}
            <p>CPU Component</p>
          </div>
        );
      case 'GPU':
        return (
          <div>
            {/* GPU component content */}
            <p>GPU Component</p>
          </div>
        );
      case 'DISK':
        return (
          <div>
            {/* DISK component content */}
            <p>DISK Component</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <SidebarContainer>
        <Title>Performance</Title>
        <List>
          <ListItem onClick={() => handleItemClick("CPU")}>CPU</ListItem>
          <ListItem onClick={() => handleItemClick("GPU")}>GPU</ListItem>
          <ListItem onClick={() => handleItemClick("DISK")}>DISK</ListItem>
        </List>
      </SidebarContainer>
      <div>
        {renderComponent()}
      </div>
    </div>
  );
};

export default Sidebar;
