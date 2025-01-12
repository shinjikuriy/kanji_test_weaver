import { Textbook } from '@types'
import { render } from 'hono/jsx/dom'
import { useState } from 'hono/jsx/dom'

function App() {
  const [textbooks, setTextbooks] = useState<Textbook[]>([])
  const fetchTextbooks = async () => {
    const response = await fetch('/api/textbooks')
    if (!response.ok) {
      throw new Error('Failed to fetch textbooks')
    }
    const textbooks = await response.json()
    setTextbooks(textbooks)
  }

  return (
    <>
      <div>
        <h1>Hello, World!</h1>
      </div>
      <div>
        <h2>Textbooks</h2>
        <button onClick={fetchTextbooks}>show textbooks</button>
        <p>{textbooks.map(textbook => <button>textbook.title</button>)}</p>
      </div>
    </>
  )
}

render(<App />, document.body)
