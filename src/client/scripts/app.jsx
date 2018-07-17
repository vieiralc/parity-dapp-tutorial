import React from 'react';
import {bonds} from 'oo7-parity'
import {Rspan, ReactiveComponent} from 'oo7-react'
import {Bond} from 'oo7';
import {AccountIcon, TransactionProgressLabel} from 'parity-reactive-ui'
import './app.css'
 
const CounterABI = [
	{"constant":false,"inputs":[{"name":"_option","type":"uint256"}],"name":"vote","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"hasVoted","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"votes","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"who","type":"address"},{"indexed":true,"name":"option","type":"uint256"}],"name":"Voted","type":"event"}
]
const ContractAddress = '0x0482D23F8657Fe9fBC011199e89Bfb83eF6714f2'

const Options = ['Red', 'Green', 'Blue']


export class App extends React.Component {

	constructor() {
		super()
		this.counter = bonds.makeContract(ContractAddress, CounterABI)
		this.state = { tx: null }
		this.voted = this.counter.hasVoted(bonds.me)
		this.prevVote = this.counter.Voted({ who: bonds.me })
		this.prevVotes = this.counter.Voted({ who: bonds.accounts })
	}

	render() {

		let votingEnabled = Bond.all([this.voted, this.state.tx])
			.map(([v, t]) => !v && (!t || !!t.failed))

		return (
			<div id='container'>
				<div id='main'>
					{Options.map((option, i) => (
						<div key={i}>
							<VoteOption 
								enabled={votingEnabled} 
								label={option} 
								votes={this.counter.votes(i)} 
								vote={() => this.setState({tx: this.counter.vote(i)})}
								already={this.prevVotes.map(a => a.filter(x => x.option == i).map(x => x.who))}
							/>
						</div>
					))}

					<div style={{marginTop: '1em'}}>
						<TransactionProgressLabel value={this.state.tx}/>
					</div>

					{/* <Rspan>
						{this.prevVote.map(v => v.length > 0 ? `Already voted for ${Options[v[0].option]}` : '')}
					</Rspan> */}
				</div>
			</div>
		)
	}
}

class VoteOption extends ReactiveComponent {
	constructor() {
		super(['votes', 'enabled', 'already'])
	}

	readyRender() {
		let s = {float: 'left', minWidth: '3em'}
		if (!this.state.enabled)
			s.cursor = 'not-allowed'
		
		return (
			<span style={{ marginLeft: '10px', borderLeft: `${1 + this.state.votes * 10}px black solid` }}>
				<a style={s} href='#' onClick={this.state.enabled && this.props.vote}>
					{this.props.label}
				</a>

				{this.state.already.map(a => (
					<AccountIcon style={{width: '1.2em', verticalAlign: 'bottom', marginLeft: '1ex'}} key={a} address={a}/>
				))}
			</span>
		)
	}
}