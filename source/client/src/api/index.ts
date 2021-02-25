import axios, { AxiosResponse } from "axios";
import { message } from "antd";
const ApiPrefix = "/api/v1";

const handleReponse = (res: AxiosResponse<any>) => {
  if (res.data.rCode === 0) {
    return res.data.data;
  } else {
    message.error(res.data.msg || "请求异常");
    return res.data;
  }
};
/**
 * 获取Github项目信息
 * @param repoId
 */
export function getProjectInfoByRepoId() {
  return axios
    .get<Record<string, any>>(`${ApiPrefix}/gitlab/projects`)
    .then((res) => handleReponse(res));
}

export function getMplist() {
  return axios
    .get<Record<string, any>>(`${ApiPrefix}/mp/list`)
    .then((res) => handleReponse(res));
}

/**
 * 构建体验版
 * @param repoId
 */
export function buildExperience(data: object) {
  axios.defaults.timeout = 60 * 6 * 60000;
  return axios
    .post<Record<string, any>>(`${ApiPrefix}/build/experience`, data)
    .then((res) => handleReponse(res));
}
