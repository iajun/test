import React, { Component } from 'react';
import Particle from 'particleground-light'
import NewYear from './newYear'

const isSpringFestival = Date.now() >= 1549209600000 && Date.now() <= 1550505600000

class LoginBackground extends Component {
  componentDidMount() {
    if (!isSpringFestival)
      new Particle(document.getElementById('particle'), {
        dotColor: 'rgba(255,255,255,0.07)',
        lineColor: 'rgba(255,255,255,0.07)'
      })
  }

  render() {
    return (
      !isSpringFestival ?
        <div style={{ position: 'absolute', top: 0, left: 0, height: '100vh', width: '100vw' }}>
          <div id="particle" style={{ position: 'relative', height: '100%', width: '100%', background: '#333' }}></div>
        </div> :
        <NewYear />
    );
  }
}

export default LoginBackground;