import axios from 'axios';
import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log(error, errorInfo);
    axios.post('/api/log', {component: 'pk', data: `${error}\ntrace:${errorInfo.componentStack}`})
  }

  render() {
    if (this.state.hasError) {
      localStorage.removeItem('system')
      localStorage.removeItem('switches')
      localStorage.removeItem('members')
      localStorage.removeItem('groups')
      localStorage.removeItem('request_queue')
      setTimeout(() => window.location.reload(), 1500)

      return <div style={{ margin: '0 auto', textAlign: 'center' }}>
        <h1>something went wrong</h1>
        <h1>the error is being reported</h1>
        <h1>clearing cache data and refreshing the page...</h1>
        <div style={{ width: '100px', height: '100px', position: 'relative', margin: '2rem auto' }}>
          <span className="loader" style={{ borderBottomColor: 'rgba(41, 146, 162, 1)' }}></span>
        </div>
        <h1>stuck on this screen?</h1>
        <button
          onClick={() => { localStorage.clear(); window.location.reload() }}
          style={{}}
        >clear localStorage</button>
      </div>
    }
    return this.props.children;
  }
}