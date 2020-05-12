import React from 'react';
import { Component } from 'react';
import { NavLink as RRNavLink } from 'react-router-dom';
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
    const isLoggedIn = this.props.isLoggedIn;

    return (      
      <Navbar color='light' light expand='md'>
        <div className='container'>
          <NavbarBrand onClick={toggle} tag={RRNavLink} to='/'>
            Words learning
          </NavbarBrand>
          <NavbarToggler onClick={toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className='mr-auto' navbar>
              <NavItem className='d-flex align-items-center'>
                <NavLink onClick={toggle} tag={RRNavLink} className='font-weight-bold' to='/dictionaries'>
                  Dictionaries
                </NavLink>
              </NavItem>
              <NavItem className='d-flex align-items-center'>
                <NavLink onClick={toggle} tag={RRNavLink} className='font-weight-bold' to='/words'>
                  Words
                </NavLink>
              </NavItem>
              <NavItem className='d-flex align-items-center'>
                <NavLink onClick={toggle} tag={RRNavLink} className='font-weight-bold' to='/games'>
                  Games
                </NavLink>
              </NavItem>
            </Nav>            
            { isLoggedIn ? (
              <Nav className='ml-auto' navbar>
                <NavItem className='d-flex align-items-center'>
                  <NavLink onClick={toggle} tag={RRNavLink} className='font-weight-bold' to='/profile'>
                    Profile
                  </NavLink>
                </NavItem>
                <NavItem className='d-flex align-items-center'>
                  <NavLink onClick={toggle} tag={RRNavLink} className='font-weight-bold' to='/logout'>
                    Logout
                  </NavLink>
                </NavItem>
              </Nav>
              ) : (
              <Nav className='ml-auto' navbar>
                <NavItem className='d-flex align-items-center'>
                  <NavLink onClick={toggle} tag={RRNavLink} className='font-weight-bold' to='/register'>
                    Register
                  </NavLink>
                </NavItem>
                <NavItem className='d-flex align-items-center'>
                  <NavLink onClick={toggle} tag={RRNavLink} className='font-weight-bold' to='/login'>
                    Login
                  </NavLink>
                </NavItem>                  
              </Nav>              
              )}
          </Collapse>
        </div>
      </Navbar>
      
    );  
  }
}
  
export default MyNavBar;