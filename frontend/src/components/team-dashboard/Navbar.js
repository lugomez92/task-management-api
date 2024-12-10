import React, { useState } from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';

function Navbar({ onLogout }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
    navigate('/');
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg">
      <Container fluid>
        {/* Page Title */}
        <BootstrapNavbar.Brand href="#" className="d-flex align-items-center">
          Team Board
        </BootstrapNavbar.Brand>

        {/* User Dropdown */}
        <Nav className="ml-auto d-flex align-items-center">
          <Dropdown show={showDropdown} onToggle={setShowDropdown}>
            <Dropdown.Toggle
              as="div"
              onClick={toggleDropdown}
              className="d-flex align-items-center text-light"
              style={{ cursor: 'pointer' }}
            >
              <FaUserCircle size={30} />
            </Dropdown.Toggle>
            <Dropdown.Menu align="end">
              <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;