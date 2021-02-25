import React, { Fragment } from 'react'
import { Typography, Row } from 'antd'
import ProjectPanels from './components/ProjectPanels'
import './App.css'
const { Title } = Typography
function App() {
  return (
    <Fragment>
      <Row justify='center'>
        <Title level={4}>小程序构建上传</Title>
      </Row>
      <ProjectPanels />
    </Fragment>
  )
}

export default App
