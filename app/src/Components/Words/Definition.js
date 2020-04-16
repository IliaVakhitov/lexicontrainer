import React from 'react';
import { Component } from 'react';
import { InputGroup, InputGroupAddon, InputGroupText,
  Popover, PopoverBody } from 'reactstrap';

import CreatableSelect from 'react-select/creatable';

class Definition extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
      options: [],
      definitions: [],
      showPopover: false,
      requestingData: false,
      definitionPopover: false
    };
    
    this.showPopover = this.showPopover.bind(this);
    this.requestData = this.requestData.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleCreate = this.handleCreate.bind(this);
    this.updateOptions = this.updateOptions.bind(this);
    this.checkOptions = this.checkOptions.bind(this);
    
    this._isMounted = false; 
  }

  componentDidMount() {
    
    this._isMounted = true; 
    const definition = this.props.definition;
    const definitions = this.props.definitions;
    let value = this.createOption(definition);
    this.setState({
      value: value,
      definitions: definitions
    });       
    this.updateOptions();
  }

  checkOptions() {
    // TODO 
    //reset definitons when new word has been saved
    if (!this.props.spelling) {
      this.setState({ 
        value:'',
        definitions: [],
        options: []
      });
      return;
    }
    if (this.state.definitions.length !== this.state.options.length) {
      this.updateOptions();
    }
  }

  showPopover(show) {
    this.setState({ showPopover: show });
  }

  updateOptions() {
    let options = [];
    this.state.definitions.forEach(element => {
      let newOption = this.createOption(element);
      options.push(newOption);
    });
    this.setState({ 
      options: options
    });
  }

  createOption(value) {    
    return ({      
      label: value,
      value: value,
    });    
  }

  requestData() {    
    const spelling = this.props.spelling;
    if (!spelling) {
      console.log('Spelling is empty');
      return;
    }
    this.setState({ requestingData: true });
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    fetch('/words/get_definition', {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        'spelling': spelling
      })
    })
      .then(res => res.json())
      .then(
      (data) => {
        if ('error' in data) {
          console.log(data); 
          this.setState({
            requestingData: false
          });
          return;
        }       
        if ('message' in data) {
          console.log(data); 
          this.setState({
            requestingData: false
          });
          return; 
        }
        this.setState({
          definitions: data.definitions,
          requestingData: false
        });
        this.updateOptions();
      },
      (error) => {
        console.log(error); 
        this.setState({
          requestingData: false
        });
      }
    );    
  }

  
  handleChange(newValue){
    this.setState({
      value: newValue
    });
    this.props.updateDefinition(newValue === null ? '' : newValue.value);
  }
  

  handleCreate(inputValue) {
    this.setState({ requestingData: true });
    let definitions = this.state.definitions;
    let value = this.createOption(inputValue);
    definitions.push(inputValue);
    this.setState({
      requestingData: false,
      definitions: definitions,
      value: value
    });
    this.props.updateDefinition(inputValue);
    this.updateOptions();
  }

  render() {

    return (
      <InputGroup className='my-2'>
        <Popover
          placement='top'
          isOpen={this.state.showPopover}
          target={'definitionText'.concat(this.props.id)}>
          <PopoverBody>
            Get definition from Words API
          </PopoverBody>
        </Popover>
        <InputGroupAddon  style={{width:'15%'}} addonType='prepend'>
          <InputGroupText 
            className='w-100'
            tag='a' 
            name={'definitionText'.concat(this.props.id)}
            id={'definitionText'.concat(this.props.id)}
            onMouseOver={() => this.showPopover(true)}
            onMouseLeave={() => this.showPopover(false)}
            onClick={this.requestData}
            style={{ cursor: 'pointer' }}
          >
            Definition 
          </InputGroupText>
        </InputGroupAddon>     
        <div style={{width:'85%'}}>
          <CreatableSelect              
            isClearable
            isDisabled={this.state.requestingData}
            isLoading={this.state.requestingData}
            onMenuOpen={this.checkOptions}
            onChange={this.handleChange} 
            onCreateOption={this.handleCreate}
            options={this.state.options}  
            value={this.state.value}       
          />           
        </div> 
      </InputGroup>             
    );
  }
}

export default Definition;
          