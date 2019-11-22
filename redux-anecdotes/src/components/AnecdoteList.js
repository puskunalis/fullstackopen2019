import React from 'react'
import { connect } from 'react-redux'
import { addVote } from '../reducers/anecdoteReducer'
import { createNotification } from '../reducers/notificationReducer'

const AnecdoteList = props => {
  const anecdotes = props.anecdotes

  const showNotification = message => {
    props.createNotification(message)
    setTimeout(() => props.createNotification(null), 5000)
  }

  const vote = anecdote => {
    props.addVote(anecdote.id)
    showNotification(`you voted '${anecdote.content}'`)
  }

  return (
    <div>
      {anecdotes.filter(a => a.content.toLowerCase().includes(props.filter)).sort((a, b) => b.votes - a.votes).map(anecdote =>
        <div key={anecdote.id}>
          <div>
            {anecdote.content}
          </div>
          <div>
            has {anecdote.votes}
            <button onClick={() => vote(anecdote)}>vote</button>
          </div>
        </div>
      )}
    </div>
  )
}

const mapStateToProps = state => {
  return {
    anecdotes: state.anecdotes,
    filter: state.filter
  }
}

export default connect(
  mapStateToProps,
  { createNotification, addVote }
)(AnecdoteList)