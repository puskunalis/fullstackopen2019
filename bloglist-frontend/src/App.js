import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Redirect, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import Blog from './components/Blog'
import Create from './components/Create'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import loginService from './services/login'
import { useField } from './hooks/index'
import { initializeBlogs, addLike, removeBlog, addComment } from './reducers/blogReducer'
import { createNotification } from './reducers/notificationReducer'
import { setUser } from './reducers/userReducer'
import blogService from './services/blogs'
import userService from './services/users'
import './style.css'

const App = props => {
  const username = useField('text')
  const password = useField('password')
  const [users, setUsers] = useState([])

  useEffect(() => {
    const getUsers = async () => {
      const response = await userService.getAll()
      setUsers(response)
    }
    getUsers()

    props.initializeBlogs()

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

  if (users.length > 0 && props.blog.length > 0) {
    const padding = { padding: 30 }

    return (
      <div>
        <Router>
          <div>
            <p className="header">
              <Link style={padding} to="/">blogs</Link>

              <Link style={padding} to="/users">users</Link>

              {props.user.name} logged in <button onClick={logout}>logout</button>
            </p>

            {props.notification && <Notification message={props.notification} />}

            <h1 className="blog-app">blog app</h1>

            <Route exact path="/" render={() => (
              <div>
                <Togglable style={{ textAlign: 'center' }} buttonLabel="new blog">
                  <Create />
                </Togglable>

                {props.blog.map(blog =>
                  <Blog key={blog.id} blog={blog} user={props.user} />
                )}
              </div>
            )} />

            <Route exact path="/users" render={() => (
              <div>
                <h1>Users</h1>
                <table>
                  <tbody>
                    <tr key="123">
                      <td></td>
                      <td><b>blogs created</b></td>
                    </tr>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td style={{ padding: 5 }}><Link to={`/users/${user.id}`}>{user.name}</Link></td>
                        <td>{user.blogs.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )} />

            <Route exact path="/users/:id" render={({ match }) => {
              const user = users.filter(user => user.id === match.params.id)[0]
              return (
                <div>
                  <h1>{user.name}</h1>
                  <h2>added blogs</h2>
                  <ul>
                    {user.blogs.map(blog => <li key={blog.id}>{blog.title}</li>)}
                  </ul>
                </div>
              )
            }} />

            <Route exact path="/blogs/:id" render={({ match }) => {
              try {
                const blog = props.blog.filter(b => b.id === match.params.id)[0]
                const showButton = { display: blog.user.username === props.user.username ? '' : 'none' }

                const addComment = event => {
                  event.preventDefault()

                  props.addComment(blog, event.target.comment.value)

                  event.target.comment.value = ''
                }

                return (
                  <div>
                    <h1>{blog.title}</h1>
                    <a href={blog.url}>{blog.url}</a><br />
                    {blog.likes} likes<button onClick={() => props.addLike(blog)}>like</button><br />
                    added by {blog.user.name ? blog.user.name : props.user.name}<br />
                    <button style={blog.user.name ? showButton : { display: '' }} onClick={() => props.removeBlog(blog)}>remove</button>

                    <h2>comments</h2>

                    <form onSubmit={addComment}>
                      <input type="text" name="comment"></input>
                      <button type="submit">add comment</button>
                    </form>

                    <ul>
                      {blog.comments.map(comment => <li key={Math.random()}>{comment}</li>)}
                    </ul>
                  </div>
                )
              } catch (e) {
                return (
                  <Redirect to="/" />
                )
              }
            }} />
          </div>
        </Router>
      </div>
    )
  }

  return (
    <div></div>
  )
}

const mapStateToProps = state => {
  return {
    notification: state.notification,
    blog: state.blog,
    user: state.user
  }
}

export default connect(mapStateToProps, { initializeBlogs, addComment, createNotification, setUser, addLike, removeBlog })(App)