import React from 'react';
import { Component } from 'react';
import { InputGroup, InputGroupAddon, InputGroupText,
  Popover, PopoverBody } from 'reactstrap';

import CreatableSelect from 'react-select/creatable';

class Symonyms extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value:[],
      options: [],
      synonyms: [],
      showPopover: false,
      requestingData: false
    };
       
    this.showPopover = this.showPopover.bind(this);
    this.requestData = this.requestData.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleCreate = this.handleCreate.bind(this);
    this.checkOptions = this.checkOptions.bind(this);
  }

  componentDidMount() {
    this.setState({
      synonyms: this.props.synonyms
    }); 
    this.updateOptions();
  }

  showPopover(show) {
    this.setState({ showPopover: show });
  }

  checkOptions() {
    if (this.state.synonyms.length !== this.state.options.length) {
      this.updateOptions();
    }
  }

  updateOptions() {
    let options = [];
    this.state.synonyms.forEach(element => {
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
    fetch('/words/get_synonyms', {
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
          synonyms: data.synonyms,
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
  }

  handleCreate(inputValue) {
    this.setState({ requestingData: true });
    let synonyms = this.state.synonyms;
    let value = this.state.value;
    let newOption = this.createOption(inputValue);
    value.push(newOption);
    synonyms.push(inputValue);
    this.setState({
      requestingData: false,
      synonyms: synonyms,
      value: value
    });
    this.updateOptions();
  }

  render() {

    return (
      <InputGroup className='my-2'>
        <Popover
          placement='top'
          isOpen={this.state.showPopover}
          target={'synonymsText'.concat(this.props.id)}>
          <PopoverBody>
            Get synonyms from Words API
          </PopoverBody>
        </Popover>
        <InputGroupAddon style={{width:'15%'}} addonType='prepend'>
          <InputGroupText 
            className='w-100'
            tag='a' 
            name={'synonymsText'.concat(this.props.id)}
            id={'synonymsText'.concat(this.props.id)}
            onMouseOver={() => this.showPopover(true)}
            onMouseLeave={() => this.showPopover(false)}
            onClick={this.requestData}
            style={{ cursor: 'pointer' }}
          >
            Symonyms
          </InputGroupText>
        </InputGroupAddon>              
        <div style={{width:'85%'}}>
          <CreatableSelect 
            isClearable
            isMulti
            closeMenuOnSelect={false}
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

export default Symonyms;
