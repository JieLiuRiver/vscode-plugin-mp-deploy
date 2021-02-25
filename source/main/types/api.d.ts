type apiData = {
  [propName: string]: any
}

interface ApiResult {
  errorCode: number,
  data?: {
    [propName: string]: any
  },
  msg?: string
}

interface ApiResponse {
  rCode: number
  msg?: string
  data?: apiData
  permission?: BasicObject
}

interface GitlabTagInfo {
  name: string,
  commit: { id: string }
}

interface GitlabCommit {
  id: string,
  short_id: string,
  title: string,
  author_name: string,
  author_email: string,
  created_at: string,
  committer_name: string,
  committer_email: string,
  message: string,
}

interface OperatorInfo {
  name: string,
  id: string,
}
