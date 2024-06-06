import React, { useState } from 'react'
import axios from 'axios'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'

const articlesUrl = 'http://localhost:9000/api/articles'
const loginUrl = 'http://localhost:9000/api/login'

const setToken = token => localStorage.setItem('token', token)
const getToken = () => localStorage.getItem('token')
const deleteToken = () => localStorage.removeItem('token')

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
      deleteToken()
      setMessage('Goodbye!')
    }
    redirectToLogin()
  }

  const login = ({ username, password }) => {
    setMessage('')
    setSpinnerOn(true)
    axios.post(loginUrl, {
      username,
      password
    })
    .then(({ data }) => {
      setToken(data.token)
      setMessage(data.message)
      redirectToArticles()
    })
    .catch(err => {
      console.log(err)
    })
    .finally(() => {
      setSpinnerOn(false)
    })
  }

  const getArticles = () => {
    setMessage('')
    setSpinnerOn(true)
    axios.get(articlesUrl, {
      headers: {
        "Authorization": getToken(),
      }
    })
    .then(({ data }) => {
      setMessage(data.message)
      setArticles(data.articles)
    })
    .catch(({ response }) => {
      redirectToLogin()
      setMessage(response.data.message)
    })
    .finally(() => {
      setSpinnerOn(false)
    })
  }

  const postArticle = article => {
    setMessage('')
    setSpinnerOn(true)
    axios.post(articlesUrl, {
      ...article
    }, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": getToken()
      }
    })
    .then(({ data }) => {
      setArticles(articles.concat(data.article))
      setMessage(data.message)
    })
    .catch(err => {
      setMessage(err.response.data.message)
    })
    .finally(() => {
      setSpinnerOn(false)
    })
  } 

  const updateArticle = ({ article_id, article }) => {
    setMessage('')
    setSpinnerOn(true)
    axios.put(`${articlesUrl}/${article_id}`, {
      ...article
    }, {
      headers: { 
        "Content-Type": "application/json",
        "Authorization": getToken(),
      }
    })
    .then(({ data }) => {
      setMessage(data.message)
      setArticles(articles.map(art => {
        if (art.article_id === article_id) {
          return { article_id, ...data.article }
        }
        return art
      }))
      setCurrentArticleId(null)
    })
    .catch(err => {
      setMessage(err.response.data.message)
    })
    .finally(() => {
      setSpinnerOn(false)
    })
  }

  const deleteArticle = article_id => {
    setMessage('')
    setSpinnerOn(true)
    axios.delete(`${articlesUrl}/${article_id}`, {
      headers: {
        "Authorization": getToken()
      }
    })
    .then(({ data }) => {
      setArticles(articles.filter(art => art.article_id != article_id))
      setMessage(data.message)
      setCurrentArticleId(null)
    })
    .catch(err => {
      setMessage(err.response.data.message)
    })
    .finally(() => {
      setSpinnerOn(false)
    })
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
