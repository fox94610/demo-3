import React, { Component } from 'react'
import styled from 'react-emotion'
import { css } from 'emotion'

const Button = styled('button')`
	border: 1px solid white;
	border-radius: 50%;
	width: 10px;
	height: 10px;
	margin: 0 7px;
`

const activeFill = css`
  background-color: white;
`

// BUTTON VERSION
// <Button onClick={()=>this.props.slideStrip("jump", index)} className={ this.props.itemBlockVisible===index ? activeFill : "" } key={index}/>

export default class NavDots extends Component {

	render() {
		return (
			<div>
				{[...Array(this.props.numOfItemBlocks)].map((x, index) =>
					<Button className={ this.props.itemBlockVisible===index ? activeFill : "" } key={index}/>
				)}
			</div>
		)
	}
}