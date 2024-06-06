import React, { useEffect, useState } from 'react'
import PT from 'prop-types'

const initialFormValues = { title: '', text: '', topic: '' }

export default function ArticleForm(props) {
  const [values, setValues] = useState(initialFormValues)
  const {
    postArticle,
    updateArticle,
    setCurrentArticleId,
    currentArticle
  } = props

  useEffect(() => {
    if (currentArticle) {
      const { text, title, topic } = currentArticle
      setValues({ text, title, topic })
    } else {
      setValues(initialFormValues)
    }
  }, [currentArticle])

  const onChange = evt => {
    const { id, value } = evt.target
    setValues({ ...values, [id]: value })
  }

  const onSubmit = evt => {
    evt.preventDefault()
    if (!currentArticle) {
      postArticle(values)
    } else {
      const { article_id } = currentArticle
      const article = { ...values }
      updateArticle({ article_id, article })
    }
    setValues(initialFormValues)
  }

  const isDisabled = () => {
    const { title, text, topic } = values
    const titleHasValue = title.trim().length >= 1
    const textHasValue = text.trim().length >= 1
    const topicHasValue = topic === 'JavaScript' || topic === 'React' || topic === 'Node'
    return !(titleHasValue && textHasValue && topicHasValue)
  }

  return (
    <form id="form" onSubmit={onSubmit}>
      <h2>Create Article</h2>
      <input
        maxLength={50}
        onChange={onChange}
        value={values.title}
        placeholder="Enter title"
        id="title"
      />
      <textarea
        maxLength={200}
        onChange={onChange}
        value={values.text}
        placeholder="Enter text"
        id="text"
      />
      <select onChange={onChange} id="topic" value={values.topic}>
        <option value="">-- Select topic --</option>
        <option value="JavaScript">JavaScript</option>
        <option value="React">React</option>
        <option value="Node">Node</option>
      </select>
      <div className="button-group">
        <button disabled={isDisabled()} id="submitArticle">Submit</button>
        {currentArticle && <button onClick={() => setCurrentArticleId(null)}>Cancel edit</button>}
      </div>
    </form>
  )
}

// 🔥 No touchy: ArticleForm expects the following props exactly:
ArticleForm.propTypes = {
  postArticle: PT.func.isRequired,
  updateArticle: PT.func.isRequired,
  setCurrentArticleId: PT.func.isRequired,
  currentArticle: PT.shape({ // can be null or undefined, meaning "create" mode (as opposed to "update")
    article_id: PT.number.isRequired,
    title: PT.string.isRequired,
    text: PT.string.isRequired,
    topic: PT.string.isRequired,
  })
}
