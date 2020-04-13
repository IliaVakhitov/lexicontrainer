import React from 'react';
import { Component } from 'react';
import { InputGroup, InputGroupAddon, InputGroupText,
  Popover, PopoverBody} from 'reactstrap'; 

import Select from 'react-select';
import makeAnimated from 'react-select/animated';
    
const animatedComponents = makeAnimated();

class WordDictionary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dictionary: {},
      requestingData: false,
      selectDisable: true,
      showPopover: false,
      dictionaries: [],
      options: [] 
    };

    this._isMounted = false;

    this.changeDictionary = this.changeDictionary.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.changeDictionary = this.changeDictionary.bind(this);
    this.showPopover = this.showPopover.bind(this);
  }

  componentDidMount() {
    this._isMounted = true; 
    const dictionary = this.props.dictionary;
    let value = this.createOption(dictionary.id, dictionary.dictionary_name);
    this.setState({
      value: value,
      dictionary: dictionary
    });
  }
  
  showPopover(show) {
    this.setState({ showPopover: show });
  }

  changeDictionary() {
    this.setState({
      requestingData: true,
      selectDisable: false
    });

    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
    fetch('/dicts/dictionaries_list', {
      method: 'GET',
      headers: myHeaders
    })
      .then(res => res.json())
      .then(
      (data) => {
        if ('error' in data) {
          console.log(data);
          return;
        }        
        this.setState({
          dictionaries: data.dictionaries,
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
    if (newValue !== null) {
      this.props.updateDictionary(newValue.key);
    }
  }

  updateOptions() {
    let options = [];
    this.state.dictionaries.forEach(element => {
      let newOption = this.createOption(element.id, element.dictionary_name);
      options.push(newOption);
    });
    this.setState({ 
      options: options
    });
  }

  createOption(key, value) {    
    return ({ 
      key: key,     
      label: value,
      value: value,
    });    
  }

  render() {
    return(
      <InputGroup className='my-2'>
        <Popover
          placement='top'
          isOpen={this.state.showPopover}
          target={'dictionary'.concat(this.props.id)}>
          <PopoverBody>
            Change dictionary
          </PopoverBody>
        </Popover>
        <InputGroupAddon  style={{width:'11%'}} addonType='prepend'>
          <InputGroupText 
            className='w-100'
            tag='a' 
            name={'dictionary'.concat(this.props.id)}
            id={'dictionary'.concat(this.props.id)}
            onMouseOver={() => this.showPopover(true)}
            onMouseLeave={() => this.showPopover(false)}
            onClick={this.changeDictionary}
            style={{ cursor: 'pointer' }}
          >
            Dictionary 
          </InputGroupText>
        </InputGroupAddon>     
        <div style={{width:'89%'}}>
          <Select    
            components={animatedComponents}          
            isDisabled={this.state.selectDisable}
            isLoading={this.state.requestingData}
            onChange={this.handleChange} 
            options={this.state.options}  
            value={this.state.value}       
          />           
        </div> 
      </InputGroup> 
    );
  }
}

export default WordDictionary;
