import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import styled from 'react-emotion';
import { css, injectGlobal } from 'emotion';
import MaterialIcon from 'material-icons-react';
import { colors } from './components/ColorDefs';
import { TweenMax, Power4 } from 'gsap';

import NavDots from './components/NavDots';
import ItemsBlock from './components/ItemsBlock';

injectGlobal`
  * {
    margin: 0;
  }
  html {
      margin: 0;
    overflow-x: hidden;
    overflow-y: hidden;
  }
  body {
    margin: 0;
    overflow-x: hidden;
    overflow-y: hidden;
    font-family: 'Roboto', sans-serif;
    color: ${colors.white};
    background: #1c1a1b;
  }
  h1 {
    font-size: 34px;
    font-weight: 300;
  }
  button {
    color: ${colors.white};
    text-align: left;
    background-color: transparent;
    border-color: transparent;
    padding: 0px;
    &:focus {
      outline: 0;
    }
  }
`;

const MainCol = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100vh;
`;

const MainContainer = styled('div')`
  display: flex;
  justify-content: space-between;
`;

const ArrowCol = styled('button')`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: transparent;
  cursor: pointer;
  > i {
    vertical-align: middle;
    height: 55px;
    width: 55px;
    cursor: pointer;
  }
`;
const Content = styled('div')`
  width: 100%;
  margin: 0 auto;
`;
const TopRow = styled('div')`
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
`;
const NavDotsWrapper = styled('nav')`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;
const MainStripWrapper = styled('main')`
  overflow: hidden;
  max-width: 990px;
`;
const MainStrip = styled('div')`
  display: flex;
`;
const hide = css`
  opacity: 0;
  pointer-events: none;
  cursor: default;
`;

const numOfItemBlocks = 4;
const numItemsToDisplayAtATime = 4;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      itemBlockVisible: 0,
    };
    this.itemsFetchDataSuccess = this.itemsFetchDataSuccess.bind(this);
    this.userHasRatedSuccess = this.userHasRatedSuccess.bind(this);
    this.onItemFavorited = this.onItemFavorited.bind(this);
    this.updateQueryString = this.updateQueryString.bind(this);
    this.slideStrip = this.slideStrip.bind(this);
    this.itemsIdArray = [];
    this.queryString = '';
    this.currentStripXPos = 0;

    const localStorageData = localStorage.getItem('recommendations-demo');
    if (localStorageData) {
      this.userId = localStorageData;
    } else {
      this.userId = String(Math.floor(Math.random() * 1000));
      localStorage.setItem('recommendations-demo', this.userId);
    }

    // Removed 'jump directly to' functionality
    //this.blockPositions = [0, 990, 1980, 2970]
  }

  componentDidMount() {
    if (this.state.items.length === 0) {
      this.doFetch({ type: 'getItems', amt: 8 });
    }
    // For strip animation
    this.mainStrip = document.getElementsByClassName('main-strip')[0];
  }

  itemsFetchDataSuccess(items) {
    const olditems = [...this.state.items];
    this.setState({ items: [...olditems, ...items] });
  }

  userHasRatedSuccess(idOfFav) {
    const oldItems = [...this.state.items];
    const items = oldItems.filter(item => item.id !== idOfFav);
    this.setState({ items });
    this.doFetch({ type: 'getItems', amt: 1 });
  }

  doFetch(options) {
    let url, reqObj;
    if (options.type === 'like') {
      url = `http://54.191.197.111/users/${this.userId}/items/${options.itemId}`;
      reqObj = {
        method: 'POST',
        body: JSON.stringify({ rating: 'like' }),
      };
    } else if (options.type === 'dislike') {
      // If requirment for demo, this would be built out
      // Akin to 'like' would resolve to this.userHasRatedSuccess()
    } else if (options.type === 'getItems') {
      if (options.amt) {
        url =
          `http://54.191.197.111/users/${this.userId}/items?amt=${options.amt + this.queryString}`;
        reqObj = {
          method: 'GET',
        };
      } else {
        throw Error('"In "doFetch()" - type "getItems" requires "amt" value');
      }
    }

    fetch(url, reqObj)
      .then(response => {
        if (!response.ok) {
          console.log('Case 1', response.statusText);
        }
        return response;
      })
      .then(response => response.json())
      .then(data => {
        if (options.type === 'like') {
          this.userHasRatedSuccess(options.itemId);
        } else if (options.type === 'getItems') {
          this.itemsFetchDataSuccess(data.items);
        }
      })
      .catch(err => {
        console.log('Error - Case 2');
      });
  }

  // "dir" - 'left' 'right' and 'jump'
  slideStrip(dir, index) {
    const margin = 30;
    let itemBlockVisible = this.state.itemBlockVisible;

    // Determined this jump directly to functionality was not best for having most up to date favorites
    /*if (dir==="jump") {
      this.currentStripXPos = -(this.blockPositions[index]) - (index * margin)
      TweenMax.to(this.mainStrip, 0.5, {x:this.currentStripXPos, ease:Power4.easeOut})
      itemBlockVisible = index
    } else {*/

    if (dir === 'right') {
      this.currentStripXPos -= 990 + margin;
      itemBlockVisible++;
    } else {
      this.currentStripXPos += 990 + margin;
      itemBlockVisible--;
    }

    TweenMax.to(this.mainStrip, 0.5, {
      x: this.currentStripXPos,
      ease: Power4.easeOut,
    });

    this.setState({
      itemBlockVisible: itemBlockVisible,
    });

    // Incrementally add new items on slide
    if (dir === 'right') {
      // First page slide, get four more items preloaded for next right navigation
      if (this.state.items.length === 8) {
        this.doFetch({ type: 'getItems', amt: 4 });
      }

      // Second page slide, get four more items preloaded for next right navigation
      if (this.state.items.length === 12) {
        this.doFetch({ type: 'getItems', amt: 4 });
      }
    }
  }

  onItemFavorited(itemId) {
    this.doFetch({ type: 'like', itemId: itemId });
  }

  updateQueryString() {
    if (this.state.items.length > 0) {
      this.state.items.forEach(item => {
        if (this.itemsIdArray.indexOf(item.id) === -1) {
          this.itemsIdArray.push(item.id);
        }
      });
      this.queryString = '&';
      this.itemsIdArray.forEach((id, index) => {
        let join = index !== this.itemsIdArray.length - 1 ? '&' : '';
        this.queryString += 'seen=' + id + join;
      });
    }
  }

  render() {
    // Prevent loading already loaded items
    // TODO move this out of render
    // TODO move data to a state prop
    this.updateQueryString();
    return (
      <div className="App">
        <Helmet>
          <meta charSet="utf-8" />
          <title>Recommendations Engine</title>
        </Helmet>
        <div className="container">
          <div className="row">
            <MainCol className="col">
              <MainContainer>
                <ArrowCol
                  onClick={() => this.slideStrip('left')}
                  className={this.state.itemBlockVisible === 0 ? hide : ''}
                >
                  <MaterialIcon
                    icon="chevron_left"
                    size={55}
                    color={colors.white}
                  />
                </ArrowCol>
                <Content>
                  <TopRow>
                    <h1>Top recommendations for you</h1>
                    <NavDotsWrapper>
                      <NavDots
                        numOfItemBlocks={numOfItemBlocks}
                        itemBlockVisible={this.state.itemBlockVisible}
                        slideStrip={this.slideStrip}
                      />
                    </NavDotsWrapper>
                  </TopRow>
                  <MainStripWrapper>
                    <MainStrip className="main-strip">
                      {[...Array(numOfItemBlocks)].map((x, i) => (
                        <ItemsBlock
                          numOfItemBlocks={numOfItemBlocks}
                          numItemsToDisplayAtATime={numItemsToDisplayAtATime}
                          items={this.state.items}
                          itemBlockIndex={i}
                          onItemFavorited={this.onItemFavorited}
                          key={i}
                        />
                      ))}
                    </MainStrip>
                  </MainStripWrapper>
                </Content>
                <ArrowCol
                  onClick={() => this.slideStrip('right')}
                  className={this.state.itemBlockVisible === 3 ? hide : ''}
                >
                  <MaterialIcon
                    icon="chevron_right"
                    size={55}
                    color={colors.white}
                  />
                </ArrowCol>
              </MainContainer>
            </MainCol>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
