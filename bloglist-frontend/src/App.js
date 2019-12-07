import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import Blog from './components/Blog'
import Create from './components/Create'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import loginService from './services/login'
import { useField } from './hooks/index'
import { initializeBlogs } from './reducers/blogReducer'
import { createNotification } from './reducers/notificationReducer'
import { setUser } from './reducers/userReducer'
import blogService from './services/blogs'

const App = props => {
  const username = useField('text')
  const password = useField('password')

  useEffect(() => {
    props.initializeBlogs()
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      props.setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async event => {
    event.preventDefault()
    try {
      const user = await loginService.login({
        username: username.value,
        password: password.value
      })

      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )

      blogService.setToken(user.token)
      props.setUser(user)

      username.reset()
      password.reset()

      props.createNotification('', 0)
    } catch (exception) {
      props.createNotification('wrong username or password', 5)
    }
  }

  const removeReset = field => {
    const clone = Object.assign({}, field)
    delete clone.reset
    return clone
  }

  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        username
        <input {...removeReset(username)} />
      </div>
      <div>
        password
        <input {...removeReset(password)} />
      </div>
      <button type="submit">login</button>
    </form>
  )

  const logout = () => {
    props.setUser('')
    window.localStorage.clear()
  }

  if (props.user === '') {
    return (
      <div>
        <h2>Log in to application</h2>
        {props.notification && <Notification message={props.notification} />}
        {loginForm()}
      </div>
    )
  }

  return (
    <div>
      <h2>blogs</h2>

      {props.notification && <Notification message={props.notification} />}

      <p>
        {props.user.name} logged in
        <button onClick={logout}>logout</button>
      </p>

      <Togglable buttonLabel="new blog">
        <Create />
      </Togglable>

      {props.blog.map(blog =>
        <Blog key={blog.id} blog={blog} user={props.user} />
      )}
    </div>
  )
}

const mapStateToProps = state => {
  return {
    notification: state.notification,
    blog: state.blog,
    user: state.user
  }
}

export default connect(mapStateToProps, { initializeBlogs, createNotification, setUser })(App)