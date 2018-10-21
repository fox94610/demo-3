import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import { injectGlobal } from 'emotion'
import styled from 'react-emotion'
import { css } from 'emotion'
import MaterialIcon from 'material-icons-react'
import { colors } from './components/ColorDefs'
import { TweenMax, Power4 } from 'gsap'

import NavDots from './components/NavDots'
import ItemsBlock from './components/ItemsBlock'


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
`

const MainCol = styled('div')`
	display: flex;
	flex-direction: column;
	justify-content: center;
	height: 100vh;
`

const MainContainer = styled('div')`
	display: flex;
	justify-content: space-between;
`

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
`
const Content = styled('div')`
	width: 100%;
	margin: 0 auto;
`
const TopRow = styled('div')`
	display: flex;
	justify-content: space-between;
	margin-bottom: 30px;
`
const NavDotsWrapper = styled('nav')`
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
`
const MainStripWrapper = styled('main')`
	overflow: hidden;
	max-width: 990px;
`
const MainStrip = styled('div')`
	display: flex;
`
const hide = css`
  opacity: 0;
  pointer-events: none;
  cursor: default;	
`

const numOfItemBlocks = 4
const numItemsToDisplayAtATime = 4
const totalItemsToRender = numOfItemBlocks * numItemsToDisplayAtATime;
const userId = "115"

class App extends Component {

	constructor(props) {
		super(props)
		this.state = {
			items: [],
			itemBlockVisible: 0
		}
		this.itemsFetchDataSuccess = this.itemsFetchDataSuccess.bind(this)
		this.userHasRatedSuccess = this.userHasRatedSuccess.bind(this)
		this.itemsHasErrored = this.itemsHasErrored.bind(this)
		this.onItemFavorited = this.onItemFavorited.bind(this)
		this.updateQueryString = this.updateQueryString.bind(this)
		this.slideStrip = this.slideStrip.bind(this)

		this.itemsIdArray = []
		this.queryString = ""
		this.currentStripXPos = 0
		this.reducedCollection = []
		this.blockPositions = [0, 990, 1980, 2970]
	}

	componentDidMount() {
  	if (this.state.items.length===0) {
  		this.doFetch()
  	}
  	// For strip animation
  	this.mainStrip = document.getElementsByClassName('main-strip')[0]
	}

	itemsFetchDataSuccess(items) {
		if (this.reducedCollection.length > 0) {
			this.setState({ items: [...this.reducedCollection, ...items]})
			this.reducedCollection = [] // Reset
		} else {
			const itemsCopy = [...this.state.items]
			this.setState({ items: [...itemsCopy, ...items]})
		}
	}

	itemsHasErrored(arg) {
		console.log("ERRORED - "+arg)
	}

	userHasRatedSuccess(idOfFav) {
		// Removed fav item from items
		let itemCollection = [...this.state.items]
		itemCollection.forEach((item, index) => {
			if (item.id === idOfFav) {
				itemCollection.splice(index, 1);
			}
		})

		// If not enough left? Stash popped collection, will need after fetch
		if (itemCollection.length < totalItemsToRender) {
			this.reducedCollection = itemCollection
			this.doFetch()
		} else {
			// There are enough items, use reduced collection
			this.setState({ items: [...itemCollection] })
		}
	}


	doFetch(arg, id) {
		let url, reqObj
		if (arg==='like') {
			url = 'http://54.191.197.111/users/'+userId+'/items/'+id
			reqObj = {
				method: 'POST',
				body: JSON.stringify({ rating: 'like' }),
			}
		} else if (arg==='dislike') {
			// If was requirment for demo, this would be built out
			// Akin to 'like' would resolve to this.userHasRatedSuccess()
		} else {
			url = 'http://54.191.197.111/users/'+userId+'/items'+this.queryString
			console.log(url)
			reqObj = {
				method: 'GET'
			}
		}

		fetch(url, reqObj).then((response) => {
			if (!response.ok) {
				this.itemsHasErrored('Case 1')
				throw Error(response.statusText)
			}
			return response;
		}).then((response) => response.json())
		.then((data) => {
			if (arg==='like') {
				this.userHasRatedSuccess(id)
			} else {
				this.itemsFetchDataSuccess(data.items)
			}
		})
		.catch(() => this.itemsHasErrored('Case 2'))
	}

	// arg - 'left' 'right' and 'jump'
	slideStrip(dir, index) {
		const margin = 30
		let itemBlockVisible = this.state.itemBlockVisible
		if (dir==="jump") {
			this.currentStripXPos = -(this.blockPositions[index]) - (index * margin)
			TweenMax.to(this.mainStrip, 0.5, {x:this.currentStripXPos, ease:Power4.easeOut})
			itemBlockVisible = index
		} else {
			if (dir==='right') {
				this.currentStripXPos -= (990 + margin)
				itemBlockVisible++
			} else {
				this.currentStripXPos += (990 + margin)
				itemBlockVisible--
			}
			TweenMax.to(this.mainStrip, 0.5, {x:this.currentStripXPos, ease:Power4.easeOut})
		}

		this.setState({
			itemBlockVisible: itemBlockVisible
		})

		// Not enough items? Get more
		if (this.state.items.length < totalItemsToRender) {
			this.doFetch()
		}
	}

	onItemFavorited(id) {
  	this.doFetch("like", id)
	}

	updateQueryString() {
		if (this.state.items.length > 0) {
			this.state.items.forEach(item => {
				if(this.itemsIdArray.indexOf(item.id) === -1) {
					this.itemsIdArray.push(item.id)
				}
			})
			this.queryString = "?"
			this.itemsIdArray.forEach((id, index) => {
				let join = index !== this.itemsIdArray.length-1 ? "&" : ""
				this.queryString += ('seen=' + id + join)
			})
		}
	}

  render() {

  	// Prevent loading already loaded items
  	this.updateQueryString()

    return (
      <div className="App">
				<Helmet>
					<meta charSet="utf-8" />
					<title>Recommendations - Crossing Minds</title>
				</Helmet>
	      <div className="container">
	      	<div className="row">
	      		<MainCol className="col">

	      			<MainContainer>

		      			<ArrowCol onClick={()=>this.slideStrip('left')} className={this.state.itemBlockVisible===0 ? hide : ""}>
		      				<MaterialIcon icon="chevron_left" size={55} color={colors.white} />
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
		      			<ArrowCol onClick={()=>this.slideStrip('right')} className={this.state.itemBlockVisible===3 ? hide : ""}>
		      				<MaterialIcon icon="chevron_right" size={55} color={colors.white} />
		      			</ArrowCol>

	      			</MainContainer>

	      		</MainCol>
	      	</div>
	      </div>
      </div>
    )
  }
}

export default App;