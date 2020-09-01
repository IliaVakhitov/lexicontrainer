import React from 'react';
import { Component } from 'react';
import { Button, Popover, PopoverBody } from 'reactstrap';

import CreatableSelect from 'react-select/creatable';

import fetchData from '../../Utils/fetchData';

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
    this.fetchData = fetchData.bind(this);
  }

  componentDidMount() {
    let value = [];
    this.props.synonyms.forEach(synonym => {
      value.push(this.createOption(synonym));
    });
    this.setState({
      synonyms: this.props.allSynonyms.concat(this.props.synonyms),
      value: value
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
    const body = JSON.stringify({
      'spelling': spelling
    });
    this.fetchData('/get_synonyms', 'POST', [], body)    
      .then((data) => {     
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
      }
    );     
  }

  handleChange(newValue){
    this.setState({
      value: newValue
    });
    this.props.updateSynonyms(newValue === null ? '' : newValue);
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
    this.props.updateSynonyms(value === null ? '' : value);
    this.updateOptions();
  }

  render() {

    return (
      <div className='my-2'>
        <Popover
          placement='top'
          isOpen={this.state.showPopover}
          target={'synonymsText'.concat(this.props.id)}>
          <PopoverBody>
            Get synonyms from Words API
          </PopoverBody>
        </Popover>
        <Button 
          for='synonyms'
          className='my-2'
          outline
          color='dark'
          name={'synonymsText'.concat(this.props.id)}
          id={'synonymsText'.concat(this.props.id)}
          onMouseOver={() => this.showPopover(true)}
          onMouseLeave={() => this.showPopover(false)}
          onClick={this.requestData}
        >
          Symonyms
        </Button>
        <CreatableSelect 
          isClearable
          isMulti
          id='synonyms'
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
    );
  }
}

export default Symonyms;
