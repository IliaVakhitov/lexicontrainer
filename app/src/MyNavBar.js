import React from 'react';
import { Component } from 'react';
import { 
  Collapse, NavbarToggler, Navbar, NavbarBrand, Nav, NavItem, NavLink
} from 'reactstrap';

class MyNavBar extends Component {

    constructor(props) {
      super(props);
    
      this.state = {
        isOpen: false,
      }
    }
    
    
    render() {
      const toggle = () => this.setState({isOpen: !this.state.isOpen}); 
  
      return (
        
        <Navbar color="light" light expand="md">
          <div className="container">
            <NavbarBrand href="#">
              Words learning
            </NavbarBrand>
            <NavbarToggler onClick={toggle} />
            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav className="mr-auto" navbar>
                <NavItem className="d-flex align-items-center">
                  <NavLink className="font-weight-bold" href="#">
                    Home
                  </NavLink>
                </NavItem>
                <NavItem className="d-flex align-items-center">
                  <NavLink className="font-weight-bold" href="#">
                    Dictionaries
                  </NavLink>
                </NavItem>
                <NavItem className="d-flex align-items-center">
                  <NavLink className="font-weight-bold" href="#">
                    Games
                  </NavLink>
                </NavItem>
              </Nav>
              <Nav className="ml-auto" navbar>
                <NavItem className="d-flex align-items-center">
                  <NavLink className="font-weight-bold" href="#">
                    Profile
                  </NavLink>
                </NavItem>
                <NavItem className="d-flex align-items-center">
                  <NavLink className="font-weight-bold" href="#">
                    Login
                  </NavLink>
                </NavItem>              
              </Nav>
            </Collapse>
          </div>
        </Navbar>
        
      );  
    }
  }
  
export default MyNavBar;