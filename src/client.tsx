import { render } from 'hono/jsx/dom'

function App() {
  return (
    <div>
      <h1>Hello, World!</h1>
    </div>
  )
}

render(<App />, document.body)