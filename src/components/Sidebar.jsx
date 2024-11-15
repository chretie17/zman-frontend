// Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { 
  FaLeaf, 
  FaHome, 
  FaUsers, 
  FaBoxes, 
  FaChartLine,
  FaHistory,
  FaSignOutAlt,
  FaAngleRight,
  FaUserCircle,
  FaJediOrder,
  FaReceipt
} from 'react-icons/fa';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
`;

// Styled Components
const SidebarContainer = styled.div`
  width: 280px;
  height: 100vh;
  background: linear-gradient(165deg, #1b4332 0%, #2d6a4f 100%);
  color: #ffffff;
  position: fixed;
  left: 0;
  top: 0;
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 1000;
`;

const LogoSection = styled.div`
  padding: 0 2rem;
  margin-bottom: 3rem;
  animation: ${fadeIn} 0.5s ease;

  h1 {
    font-size: 1.8rem;
    font-weight: 700;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 12px;
    
    svg {
      color: #74c69d;
    }
  }

  p {
    font-size: 0.9rem;
    color: #95d5b2;
    margin-top: 0.5rem;
    margin-left: 2rem;
  }
`;

const ProfileSection = styled.div`
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  margin: 0 1rem 2rem;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: #74c69d;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }

  .info {
    h3 {
      font-size: 1rem;
      font-weight: 600;
    }
    p {
      font-size: 0.8rem;
      color: #95d5b2;
    }
  }
`;

const MenuSection = styled.div`
  flex: 1;
  padding: 0 1rem;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
`;

const MenuItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  color: ${props => props.active ? '#ffffff' : '#b7e4c7'};
  text-decoration: none;
  border-radius: 12px;
  margin-bottom: 0.5rem;
  position: relative;
  transition: all 0.3s ease;
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    transform: translateX(5px);

    .icon {
      transform: scale(1.1);
    }
  }

  .icon {
    width: 20px;
    height: 20px;
    margin-right: 1rem;
    transition: all 0.3s ease;
  }

  .arrow {
    margin-left: auto;
    opacity: ${props => props.active ? '1' : '0'};
    transform: ${props => props.active ? 'translateX(0)' : 'translateX(-10px)'};
    transition: all 0.3s ease;
  }

  ${props => props.active && `
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 4px;
      background: #74c69d;
      border-radius: 0 4px 4px 0;
    }
  `}
`;

const LogoutButton = styled.button`
  margin: 2rem;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  background: #74c69d;
  color: #1b4332;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #52b788;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Sidebar = ({ handleLogout }) => {
  const [currentTime, setCurrentTime] = useState('');
  const location = useLocation();
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const adminMenuItems = [
    { text: 'Dashboard', path: '/dashboard', icon: FaHome },
    { text: 'Users', path: '/admin/users', icon: FaUsers },
    { text: 'Manage Products', path: '/admin/products', icon: FaBoxes },
    { text: 'Manage Transactions', path: '/admin/transactions', icon: FaChartLine },
    { text: 'Manage Orders', path: '/admin/orders', icon: FaJediOrder },
    { text: 'Manage Beneficiaries', path: '/admin/beneficiaries', icon: FaJediOrder },
    { text: 'Reports', path: '/admin/reports', icon: FaReceipt },
    { text: 'Reports Gov', path: '/admin/govreport', icon: FaReceipt },
  ];

  const salesMenuItems = [
    { text: 'Dashboard', path: '/dashboard', icon: FaHome },
    { text: 'Sales', path: '/sales/products', icon: FaBoxes },
    { text: 'Sales History', path: '/sales/history', icon: FaHistory },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : salesMenuItems;

  return (
    <SidebarContainer>
      <LogoSection>
        <h1><FaLeaf /> AgriTech</h1>
        <p>{currentTime}</p>
      </LogoSection>

      <ProfileSection>
        <div className="avatar">
          <FaUserCircle />
        </div>
        <div className="info">
          <h3>{userRole === 'admin' ? 'Admin User' : 'Sales User'}</h3>
          <p>Agricultural Division</p>
        </div>
      </ProfileSection>

      <MenuSection>
        {menuItems.map((item) => (
          <MenuItem 
            to={item.path} 
            key={item.text}
            active={location.pathname === item.path ? 1 : 0}
          >
            <item.icon className="icon" />
            {item.text}
            <FaAngleRight className="arrow" />
          </MenuItem>
        ))}
      </MenuSection>

      <LogoutButton onClick={handleLogout}>
        <FaSignOutAlt /> Sign Out
      </LogoutButton>
    </SidebarContainer>
  );
};

export default Sidebar;
