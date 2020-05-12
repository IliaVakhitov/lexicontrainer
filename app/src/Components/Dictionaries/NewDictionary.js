import React from 'react';
import { Component } from 'react';
import { Input, Button, Collapse, Label } from 'reactstrap'

import fetchData from '../../Utils/fetchData';

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
    this.fetchData = fetchData.bind(this);    
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
    if ('isOpen' in this.props) {
      this.props.isOpen(!this.state.collapseOpen);
    }
  }

  saveDictionary() {
    if (!this.state.name) {
      return;
    }
    const body = JSON.stringify({
      dictionary_name: this.state.name,  
      dictionary_description: this.state.description,  
    });
    this.fetchData('/dicts/add_dictionary', 'POST', [], body)
      .then(() => {        
        this.setState({
          newDicnametionaryName:'',
          description:'',
          collapseOpen: false
        });
        this.props.onSaveDictionary();
        this.props.showMessage('Dictionary saved!');
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
          <br/>
          <Label className='my-1' for='name'>Name</Label>
          <Input 
            invalid={!this.state.name}
            type='text' 
            value={this.state.name} 
            name='name'
            id='name'
            placeholder='Type name for new dictionary'
            onChange={this.updateState}
          />
          <Label className='my-1' for='description'>Description</Label>
          <Input 
            type='text'
            name='description' 
            id='description' 
            value={this.state.description} 
            placeholder='Type description for new dictionary'
            onChange={this.updateState}
          />
        </Collapse>
      </div>
    );
  }
}

export default NewDictionary;
