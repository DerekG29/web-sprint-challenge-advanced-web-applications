import React, { useState } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'

const articlesUrl = 'http://localhost:9000/api/articles'
const loginUrl = 'http://localhost:9000/api/login'

export default function App() {
  // ✨ MVP can be achieved with these states
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState(null)
  const [spinnerOn, setSpinnerOn] = useState(false)

  // ✨ Research `useNavigate` in React Router v.6
  const navigate = useNavigate()
  const redirectToLogin = () =>  navigate('/')
  const redirectToArticles = () => navigate('articles')

  const logout = () => {
    // ✨ implement
    // If a token is in local storage it should be removed,
    // and a message saying "Goodbye!" should be set in its proper state.
    // In any case, we should redirect the browser back to the login screen,
    // using the helper above.
    if (localStorage.getItem('token')) {
      localStorage.removeItem('token')
      setMessage('Goodbye!')
    }
    redirectToLogin()
  }

  const login = async ({ username, password }) => {
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch a request to the proper endpoint.
    // On success, we should set the token to local storage in a 'token' key,
    // put the server success message in its proper state, and redirect
    // to the Articles screen. Don't forget to turn off the spinner!
    setMessage('')
    setSpinnerOn(true)
    try {
      const response = await fetch('http://localhost:9000/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) {
        throw new Error(`Problem POSTing login... ${response.status}`)
      }
      const { message, token } = await response.json()
      localStorage.setItem('token', token)
      setMessage(message)
      setSpinnerOn(false)
      redirectToArticles()
    } catch (error) {
      console.error(error)
    }
  }

  const getArticles = async () => {
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch an authenticated request to the proper endpoint.
    // On success, we should set the articles in their proper state and
    // put the server success message in its proper state.
    // If something goes wrong, check the status of the response:
    // if it's a 401 the token might have gone bad, and we should redirect to login.
    // Don't forget to turn off the spinner!
    setMessage('')
    setSpinnerOn(true)
    try {
      const response = await fetch('http://localhost:9000/api/articles', {
        headers: {
          "Authorization": localStorage.getItem('token')
        }
      })
      if (response.status === 401 || !response.ok) {
        const { message } = await response.json()
        redirectToLogin()
        setMessage(message)
        setSpinnerOn(false)
        throw new Error(`Problem GETing articles... ${response.status}`)
      }
      const { message, articles } = await response.json()
      setMessage(message)
      setArticles(articles)
      setSpinnerOn(false)
    } catch (error) {
      console.error(error)
    }
  }

  const postArticle = async article => {
    // ✨ implement
    // The flow is very similar to the `getArticles` function.
    // You'll know what to do! Use log statements or breakpoints
    // to inspect the response from the server.
    let success = null
    setMessage('')
    setSpinnerOn(true)
    try {
      const response = await fetch('http://localhost:9000/api/articles', {
        method: 'POST',
        body: JSON.stringify({ ...article }),
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem('token')
        }
      })
      if (!response.ok) {
        success = false
        const { message } = await response.json()
        setMessage(message)
        setSpinnerOn(false)
        throw new Error(`Problem POSTing new article... ${response.status}`)
      }
      success = true
      const data = await response.json()
      setArticles(articles.concat(data.article))
      setMessage(data.message)
      setSpinnerOn(false)
    } catch (error) {
      console.error(error)
    }
    return success
  }

  const updateArticle = async ({ article_id, article }) => {
    // ✨ implement
    // You got this!
    let success = null
    setMessage('')
    setSpinnerOn(true)
    try {
      const response = await fetch(`http://localhost:9000/api/articles/${article_id}`, {
        method: 'PUT',
        body: JSON.stringify(article),
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem('token')
        }
      })
      if (!response.ok) {
        success = false
        const data = await response.json()
        setMessage(data.message)
        setSpinnerOn(false)
        throw new Error(`Problem PUTing article... ${response.status}`)
      }
      success = true
      const data = await response.json()
      setMessage(data.message)
      setArticles(articles.map(art => {
        if (art.article_id === article_id) {
          return { article_id, ...data.article }
        }
        return art
      }))
      setSpinnerOn(false)
    } catch (error) {
      console.error(error)
    }
    return success
  }

  const deleteArticle = async article_id => {
    // ✨ implement
    setMessage('')
    setSpinnerOn(true)
    try {
      const response = await fetch(`http://localhost:9000/api/articles/${article_id}`, {
        method: 'DELETE',
        headers: {
          "Authorization": localStorage.getItem('token')
        }
      })
      if (!response.ok) {
        const { message } = await response.json()
        setMessage(message)
        setSpinnerOn(false)
        throw new Error(`Problem DELETEing atricle... ${response.status}`)
      }
      const data = await response.json()
      setArticles(articles.filter(art => art.article_id != article_id))
      setMessage(data.message)
      setSpinnerOn(false)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    // ✨ fix the JSX: `Spinner`, `Message`, `LoginForm`, `ArticleForm` and `Articles` expect props ❗
    <>
      <Spinner on={spinnerOn} />
      <Message message={message} />
      <button id="logout" onClick={logout}>Logout from app</button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}> {/* <-- do not change this line */}
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">Login</NavLink>
          <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login} />} />
          <Route path="articles" element={
            <>
              <ArticleForm
                postArticle={postArticle}
                updateArticle={updateArticle}
                setCurrentArticleId={setCurrentArticleId}
                currentArticle={articles.find(art => art.article_id === currentArticleId)}
              />
              <Articles
                getArticles={getArticles}
                articles={articles}
                setCurrentArticleId={setCurrentArticleId}
                currentArticleId={currentArticleId}
                deleteArticle={deleteArticle}
              />
            </>
          } />
        </Routes>
        <footer>Bloom Institute of Technology 2024</footer>
      </div>
    </>
  )
}
