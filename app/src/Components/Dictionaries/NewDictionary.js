import React from 'react';
import { Component } from 'react';
import { Input, InputGroup, InputGroupAddon, InputGroupText,
  Card, CardBody, Button, Collapse, Container } from 'reactstrap'

class NewDictionary extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
      name:'',
      description:'',
      collapseOpen: false      
    };

    this.saveDictionary = this.saveDictionary.bind(this);
    this.updateState = this.updateState.bind(this);
    this.changeCollapseOpen = this.changeCollapseOpen.bind(this);
        
  }

  updateState(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  changeCollapseOpen() {
    this.setState({
      name:'',
      description:'',
      collapseOpen: !this.state.collapseOpen
    });  
  }

  saveDictionary() {
    if (!this.state.name) {
      return;
    }
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    fetch('/dicts/add_dictionary', {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        dictionary_name: this.state.name,  
        dictionary_description: this.state.description,  
      })
    })
      .then(res => res.json())
      .then(
      (data) => {
        if ('error' in data) {
          console.log(data);
          return;
        }        
        this.setState({
          newDicnametionaryName:'',
          description:'',
          collapseOpen: false
        });
        this.props.onSaveDictionary();
      },
      (error) => {
        console.log(error);
      }
    ); 
  }

  render() {
    return (
      <div>
        <Button 
          outline
          hidden={this.state.collapseOpen}
          className='my-2' 
          color='info' 
          onClick={this.changeCollapseOpen}
        >
          Add new dictionary
        </Button>
        <Collapse isOpen={this.state.collapseOpen}>
          <Button outline 
            color='success' 
            className='mx-1 my-1'
            hidden={!this.state.collapseOpen}
            disabled={!this.state.name}
            onClick={this.saveDictionary}>
            Save
          </Button>
          <Button outline 
            color='secondary' 
            className='mx-1 my-1'
            hidden={!this.state.collapseOpen}
            onClick={this.changeCollapseOpen}>
            Cancel
          </Button>
          <InputGroup className='my-2'>
            <InputGroupAddon style={{width:'10%'}} addonType='prepend'>
              <InputGroupText className='w-100'>Name</InputGroupText>
            </InputGroupAddon>                
            <Input 
              invalid={!this.state.name}
              type='text' 
              value={this.state.name} 
              name='name'
              id='name'
              placeholder='Type name for new dictionary'
              onChange={this.updateState}
            />
          </InputGroup>          
          <InputGroup className='my-2'>
            <InputGroupAddon style={{width:'10%'}} addonType='prepend'>
              <InputGroupText className='w-100'>Description</InputGroupText>
            </InputGroupAddon>
            <Input 
              type='text'
              name='description' 
              id='description' 
              value={this.state.description} 
              placeholder='Type description for new dictionary'
              onChange={this.updateState}
            />
          </InputGroup>
        </Collapse>
      </div>
    );
  }
}

export default NewDictionary;
