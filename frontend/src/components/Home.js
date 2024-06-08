import React from 'react'
import Notes from './Notes'

function Home(props) {
  const { showAlert, mode } = props;
  
  return (
    <div>
      <Notes showAlert={showAlert} mode={mode} />
    </div>
  )
}

export default Home
