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
      dictionaryName: '',
      dictionaryId: 0,
      selectDisable: true,
      showPopover: false,
      options: [] 
    };

    this._isMounted = false;

    this.handleChange = this.handleChange.bind(this);
    this.showPopover = this.showPopover.bind(this);
    this.checkOptions = this.checkOptions.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.updateOptions = this.updateOptions.bind(this);

  }

  componentDidMount() {
    const dictionaryId = this.props.dictionaryId;
    const dictionaryName = this.props.dictionaryName;
    this._isMounted = true; 
    if (this.props.dictionaryName) {
      let value = this.createOption(dictionaryId, dictionaryName);
      this.setState({
        value: value,
        dictionaryName: dictionaryName,
        dictionaryId: dictionaryId,        
      });
    } else {
      this.setState({
        selectDisable: false
      });      
    }
  }

  checkOptions() {
    if (this.props.dictionaries.length !== this.state.options.length) {
      this.updateOptions();
    }
  }
  
  showPopover(show) {
    this.setState({ showPopover: show });
  }

  handleClick(){
    this.setState({
      selectDisable: false
    });
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
    this.props.dictionaries.forEach(element => {
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
            onClick={this.handleClick}
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
            onMenuOpen={this.checkOptions}
            options={this.state.options}  
            value={this.state.value}       
          />           
        </div> 
      </InputGroup> 
    );
  }
}

export default WordDictionary;
