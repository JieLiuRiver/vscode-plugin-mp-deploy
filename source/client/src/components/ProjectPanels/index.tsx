import React, { useEffect, useState } from 'react'
import {
  Card,
  Image,
  Tabs,
  List,
  Button,
  Select,
  Form,
  Input,
  Row,
  Spin,
  notification,
  message,
  Typography
} from 'antd'
import SockeIo from 'socket.io-client'
import dayjs from 'dayjs'
import { getProjectInfoByRepoId, getMplist } from '../../api'
// import mpconfig from './mp-deploy-config.json'

const { TabPane } = Tabs

const cliMethods = [
  { label: '体验版', value: 'upload' },
  { label: '预览版', value: 'preview' }
]

const buildTyps = [
  { label: '分支 Commit', value: 'commit' },
  { label: 'Git Tag', value: 'tag' }
]
const { Option } = Select
const PREFIX_LOCAL = '__mpform_'

const storageGet = (key: string) => window.localStorage.getItem(PREFIX_LOCAL + key)

const ProjectPanels = React.memo(function ProjectPanels() {
  const [projects, setProjects] = useState<any[]>([])
  const [mps, setMps] = useState<{ appid: string; appname: string }[]>([])
  const [isBuilding, setIsBuilding] = useState(false)
  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null)
  const [ready, setReady] = useState<boolean>(false)
  const [commitMsg, setCommitMsg] = useState<string>('')
  const [previewQrCodeUrl, setPreviewQrCodeUrl] = useState<string>('')
  const [cliMethod, setCliMethod] = useState<string>(storageGet('cliMethod') || 'upload')
  const [form] = Form.useForm()
  const init = async () => {
    const res = await getProjectInfoByRepoId()
    const resMps = await getMplist()
    setProjects(res)
    setMps(resMps)
    setReady(true)
  }

  const submitAction = async (values: any, projectInfo: any) => {
    if (isBuilding) {
      return message.warn('项目正在构建中')
    }
    values.projectId = projectInfo.id
    if (socket) {
      console.log('开始构建', values)
      socket.emit('action:start', values)
      setIsBuilding(true)
    }
  }

  const onFinishFailed = (errorInfo: any) => {
    console.log('errorInfo', errorInfo)
  }

  const initSocketEvent = () => {
    if (socket == null) {
      const socketObj = SockeIo(window.location.host, {
        path: '/job/build',
        query: {
          id: 'id-1'
        }
      })
      setSocket(socketObj)
    } else {
      socket.disconnect()
    }
  }

  useEffect(() => {
    if (socket) {
      socket.on('building', (data: any) => {
        const isSuccess = data.message.includes('完成') || data.message.includes('成功')
        notification[isSuccess ? 'success' : 'info']({
          message: data.message || data.msg
        })
      })
      socket.on('data', ({ message }: any) => {
        setIsBuilding(true)
      })
      socket.on('end', (data: any) => {
        setIsBuilding(false)
      })
      socket.on('idle', () => {
        setIsBuilding(false)
      })
      socket.on('message', (data: any) => {
        if (typeof data === 'string') {
          data = {
            message: data,
            type: 'info'
          }
        }

        const notifyConfig = {
          key: data.message,
          message: data.message,
          duration: data.type != null ? 0 : 20
        }
        if (data.type === 'success') {
          notification.success(notifyConfig)
        } else if (data.type === 'error') {
          notification.error(notifyConfig)
        } else {
          notification.info(notifyConfig)
        }
      })
      socket.on('buildError', (data: any) => {
        const { message } = data
        notification.error({
          message: '发生错误',
          description: message,
          duration: 0
        })
      })
      socket.on('stop', () => {
        socket.disconnect()
      })
      socket.on('finished', (data: { code: number; data: any }) => {
        const isSuccess = data.code === 0
        if (!isSuccess) {
          if (data.data.indexOf('invalid ip') > 0) {
            data.data = `白名单内的IP才能成功调用代码上传接口，请先配置；  ` + data.data
          }
        }
        notification[isSuccess ? 'success' : 'error']({
          message: isSuccess ? '上传成功' : data.data,
          duration: 8000
        })
        isSuccess && cliMethod === 'preview' && setPreviewQrCodeUrl(data.data)
        setIsBuilding(false)
      })
    }
  }, [socket, cliMethod])

  useEffect(() => {
    init()
    initSocketEvent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  if (!ready)
    return (
      <Row justify='center' style={{ marginTop: 50 }}>
        <Spin />
      </Row>
    )
  return (
    <Row justify='center'>
      {projects.map((project: any) => {
        const projectInfo = project.projectInfo
        const branchList = project.branchList
        const tags = project.tags || []
        const experienceQrCodeUrl = project.experienceQrCodeUrl || ''
        const getCommitMsg = (branch: string) => {
          const findU = branchList.find((o: any) => o.name === branch)
          const { message, author_name, committed_date } = findU.commit
          const date = dayjs(committed_date).format('MM/DD HH:mm')
          const result = `${message} (${author_name}: ${date})`
          form.setFieldsValue({
            desc: result
          })
          return result
        }

        const onTagChange = (tag: string) => {
          const findU = tags.find((o: any) => o.name === tag)
          if (findU) {
            form.setFieldsValue({
              desc: findU.commit.message || ''
            })
          }
        }

        const listDataSource = [
          {
            label: '项目名称',
            key: 'name'
          },
          {
            label: '仓库ID',
            key: 'id'
          },
          {
            label: '描述',
            key: 'description'
          },
          {
            label: '地址',
            key: 'web_url'
          }
        ]
        const realCommitMsg = commitMsg || getCommitMsg(storageGet('branch') || branchList[0].name)
        if (!projectInfo) return null
        return (
          <Card style={{ maxWidth: 800 }} key={`${projectInfo.name}`}>
            <List
              bordered
              style={{ marginBottom: 30 }}
              dataSource={listDataSource}
              renderItem={(item) => (
                <List.Item key={item.label}>
                  {item.label}：{projectInfo[item.key]}
                </List.Item>
              )}
            />
            <Form
              form={form}
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              onFinish={(values: any) => submitAction(values, projectInfo)}
              onFinishFailed={onFinishFailed}
              onValuesChange={(cvalues: any, avalues: any) => {
                for (let attr in cvalues) {
                  window.localStorage.setItem(`${PREFIX_LOCAL}${attr}`, cvalues[attr])
                }
              }}
            >
              <Form.Item
                style={{ marginBottom: 10, backgroundColor: '#fafafa' }}
                name='buildType'
                initialValue={storageGet('buildType') || 'commit'}
              >
                <Tabs
                  onChange={(activeKey: string) => {
                    if (activeKey === 'tag') {
                      onTagChange(form.getFieldValue('tagName'))
                    } else {
                      setTimeout(() => {
                        setCommitMsg(getCommitMsg(form.getFieldValue('branch')))
                      })
                    }
                  }}
                  size='large'
                  style={{ width: 482 }}
                  type='card'
                  defaultActiveKey={storageGet('buildType') || 'commit'}
                >
                  {buildTyps.map((o) => (
                    <TabPane tab={o.label} key={o.value}>
                      {o.value === 'commit' && (
                        <>
                          <Form.Item
                            label='选择 Branch'
                            name='branch'
                            style={{ marginLeft: 35 }}
                            rules={[{ required: true }]}
                            initialValue={storageGet('branch') || branchList[0].name}
                          >
                            <Select
                              placeholder='选择'
                              onChange={(branch: string) => setCommitMsg(getCommitMsg(branch))}
                            >
                              {branchList.map((branch: any) => (
                                <Option key={branch.name} value={branch.name}>
                                  {branch.name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                          <Form.Item label='最新 Commit' style={{ marginLeft: 40, width: '100%' }}>
                            <Typography.Text type='danger'>{realCommitMsg}</Typography.Text>
                          </Form.Item>
                        </>
                      )}
                      {o.value === 'tag' && (
                        <>
                          <Form.Item
                            label='选择 Tag  '
                            name='tagName'
                            style={{ marginLeft: 50 }}
                            rules={[{ required: true }]}
                            initialValue={storageGet('tagName') || ''}
                          >
                            <Select placeholder='' onChange={onTagChange}>
                              {tags.map((tag: any) => (
                                <Option key={tag.name} value={tag.name}>
                                  {tag.name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </>
                      )}
                    </TabPane>
                  ))}
                </Tabs>
              </Form.Item>

              <Form.Item
                label='小程序'
                name='appid'
                rules={[{ required: true }]}
                initialValue={storageGet('appid') || (mps.length ? mps[0].appid : '')} //
              >
                <Select placeholder='选择'>
                  {mps.map((mp: any) => (
                    <Option key={mp.appid} value={mp.appid}>
                      {mp.appname}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label='构建类型'
                name='cliMethod'
                rules={[{ required: true }]}
                initialValue={storageGet('cliMethod') || 'upload'}
              >
                <Select placeholder='选择' onChange={(method: string) => setCliMethod(method)}>
                  {cliMethods.map((mp: any) => (
                    <Option key={mp.value} value={mp.value}>
                      {mp.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label='版本version'
                name='version'
                rules={[{ required: true }]}
                initialValue={storageGet('version') || 'v1.0.0'}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label='构建命令'
                name='buildCommand'
                rules={[{ required: true }]}
                initialValue={storageGet('buildCommand') || 'yarn build:weapp'}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label='描述信息desc'
                name='desc'
                initialValue={storageGet('desc') || realCommitMsg || dayjs().format('YYYY-MM-DD HH:mm:ss')}
              >
                <Input maxLength={30} />
              </Form.Item>
              <Form.Item label='发布机器人robot' name='robot' initialValue={Number(storageGet('robot')) || 1}>
                <Select placeholder='选择'>
                  {Array.from({ length: 31 }, (_, index: number) => index).map((robot: any) => (
                    <Option key={robot} value={robot}>
                      {robot}号机器人
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              {cliMethod === 'upload' && experienceQrCodeUrl && (
                <Form.Item label='体验版二维码'>
                  <Row justify='start' align='middle'>
                    <Image width={120} src={experienceQrCodeUrl} />
                    <Typography.Text>注意：体验版二维码只有一个，切换为体验版再扫</Typography.Text>
                  </Row>
                </Form.Item>
              )}
              {cliMethod === 'preview' && previewQrCodeUrl && (
                <Form.Item label='预览版二维码'>
                  <Row justify='start' align='middle'>
                    <Image width={120} src={previewQrCodeUrl} />
                  </Row>
                </Form.Item>
              )}
              <Form.Item>
                <Row justify='center' align='middle'>
                  <Button type='primary' size='large' htmlType='submit' loading={isBuilding}>
                    {isBuilding ? '构建中' : '构建部署'}
                  </Button>
                </Row>
              </Form.Item>
            </Form>
          </Card>
        )
      })}
    </Row>
  )
})

export default ProjectPanels
