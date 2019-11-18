import React, { useState, useEffect } from 'react'
import Blog from './components/Blog'
import Create from './components/Create'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
//import blogService from './services/blogs'
import loginService from './services/login'
import { useField, useResource } from './hooks/index'

const App = () => {
  const [message, setMessage] = useState([null, true])
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')
  const username = useField('text')
  const password = useField('password')
  const blogService = useResource('http://localhost:3003/api/blogs')

  const showNotification = (text, success) => {
    setMessage([text, success])
    setTimeout(() => setMessage([null, true]), 5000)
  }

  useEffect(() => {
    const getBlogs = async () => {
      const blogs = await blogService.getAll()
      blogs.sort((a, b) => b.likes - a.likes)
      setBlogs(blogs)
    }
    getBlogs()
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (event) => {
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
      setUser(user)

      username.reset()
      password.reset()

      setMessage([null, true])
    } catch (exception) {
      showNotification('wrong username or password', false)
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
    setUser(null)
    window.localStorage.clear()
  }

  if (user === null) {
    return (
      <div>
        <h2>Log in to application</h2>
        <Notification message={message} />
        {loginForm()}
      </div>
    )
  }

  const sendLike = async blog => {
    await blogService.like({ ...blog, likes: blog.likes + 1 })
    setBlogs(blogs.map(b => b.id === blog.id ? { ...b, likes: b.likes + 1 } : b))
  }

  const remove = async blog => {
    if (window.confirm(`remove blog ${blog.title}`)) {
      await blogService.remove(blog)
      setBlogs(blogs.filter(b => b.id !== blog.id))
    }
  }

  return (
    <div>
      <h2>blogs</h2>

      <Notification message={message} />

      <p>
        {user.username} logged in
        <button onClick={logout}>logout</button>
      </p>

      <Togglable buttonLabel="new blog">
        <Create showNotification={showNotification} blogs={blogs} title={title} author={author} url={url} setBlogs={setBlogs} setTitle={setTitle} setAuthor={setAuthor} setUrl={setUrl} />
      </Togglable>

      {blogs.map(blog =>
        <Blog key={blog.id} blog={blog} sendLike={sendLike} remove={remove} user={user} />
      )}
    </div>
  )
}

export default App