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
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState(null)
  const [spinnerOn, setSpinnerOn] = useState(false)

  const navigate = useNavigate()
  const redirectToLogin = () =>  navigate('/')
  const redirectToArticles = () => navigate('articles')

  const logout = () => {
    if (localStorage.getItem('token')) {
      localStorage.removeItem('token')
      setMessage('Goodbye!')
    }
    redirectToLogin()
  }

  const login = async ({ username, password }) => {
    setMessage('')
    setSpinnerOn(true)
    try {
      const response = await fetch(loginUrl, {
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
    setMessage('')
    setSpinnerOn(true)
    try {
      const response = await fetch(articlesUrl, {
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
    let success = null
    setMessage('')
    setSpinnerOn(true)
    try {
      const response = await fetch(articlesUrl, {
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
    let success = null
    setMessage('')
    setSpinnerOn(true)
    try {
      const response = await fetch(`${articlesUrl}/${article_id}`, {
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
    setMessage('')
    setSpinnerOn(true)
    try {
      const response = await fetch(`${articlesUrl}/${article_id}`, {
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
