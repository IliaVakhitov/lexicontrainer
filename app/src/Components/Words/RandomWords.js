import React from 'react';
import { Component } from 'react';
import { Carousel, CarouselIndicators, CarouselItem,
  CarouselControl, Spinner, Container } from 'reactstrap';
 import { withRouter } from 'react-router-dom';

 import fetchData from '../../Utils/fetchData';

class RandomWords extends Component {
  constructor(props){
    super(props);

    this.state = {
      requestingData: false,
      words: [],
      animating: false,
      activeIndex: 0,

    };

    this._isMounted = false;

    this.fetchData = fetchData.bind(this);
    this.setAnimating = this.setAnimating.bind(this);
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.goToIndex = this.goToIndex.bind(this);
    this.setActiveIndex = this.setActiveIndex.bind(this);
    this.getWordsItem = this.getWordsItem.bind(this);
  }

  componentDidMount() {
    this._isMounted = true; 
    this._isMounted && this.getRandonWords();
  }

  getRandonWords() {
    this.setState({ 
      requestingData: true
    });
    this.fetchData('/words/random_words')
      .then((data) => {        
        this.setState({
          words: data.words,
          requestingData: false
        });
        
      }
    );
  }
  
  next() {
    if (this.state.animating) 
      return;
    const activeIndex = this.state.activeIndex;
    const nextIndex = 
      activeIndex === this.state.words.length - 1 
      ? 0 
      : activeIndex + 1;
    this.setActiveIndex(nextIndex);
  }

  previous() {
    if (this.state.animating) 
      return;
    const activeIndex = this.state.activeIndex;
    const nextIndex = 
      activeIndex === 0 
      ? this.state.words.length - 1 
      : activeIndex - 1;
    this.setActiveIndex(nextIndex);
  }

  goToIndex(newIndex) {
    if (this.state.animating) 
      return;
    this.setActiveIndex(newIndex);
  }

  setAnimating(animating) {
    this.setState({
      animating: animating
    })
  }

  setActiveIndex(activeIndex) {
    this.setState({
      activeIndex: activeIndex
    })
  }

  getWordsItem(word) {
    let synonyms='';
    word.synonyms.forEach(synonym => {
      synonyms += synonym + ' '
    });
    return (
      <CarouselItem
        onExiting={() => this.setAnimating(true)}
        onExited={() => this.setAnimating(false)}
        key={word.id}
      >
        
        <Container style={{backgroundColor:'lightblue', textAlign: 'center'}}>
          <br/>
          <h2 >
            {word.spelling}
          </h2>
          <Container className='w-75'>
            {word.definition}
          </Container>
          <Container className='w-75'>
            {synonyms && <i>{synonyms}</i>}   
          </Container> 
          <br/>                  
          <br/>                  
          <br/>                  
        </Container>   
                   
      </CarouselItem>      
    );
  }

  render() {
    const words = this.state.words.map(word => 
      this.getWordsItem(word)
    );
    return(
      <Container >
        <h4 style={{textAlign: 'center'}}>Words of a day</h4>
        {this.state.requestingData && 
          <Spinner type='grow' color='dark' />
        }
        {!this.state.requestingData &&
          <Carousel
            activeIndex={this.state.activeIndex}
            next={this.next}
            previous={this.previous}
          >
            <CarouselIndicators 
              style={{backgroundColor:'blask'}}
              items={this.state.words} 
              activeIndex={this.state.activeIndex} 
              onClickHandler={this.goToIndex} 
            />
            {words}
            <CarouselControl 
              direction="prev" 
              directionText="Previous" 
              onClickHandler={this.previous} 
            />
            <CarouselControl 
              direction="next" 
              directionText="Next" 
              onClickHandler={this.next} 
            />
          </Carousel>          
        }
      </Container>      
    );  
  }
}

export default withRouter(RandomWords);