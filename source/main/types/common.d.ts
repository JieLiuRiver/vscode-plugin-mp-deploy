type BasicObject = {
  [propName: string]: any;
};

type Env = "docker" | "pre" | "production";

type BaseResult<T> = T & {
  id: string;
  updatedAt: string;
  createdAt: string;
};

interface VscodeConfig {
  gitlabHost: string
  gitlabToken: string
  gitlabRepoIds: string[]
  mpPrivateKeyPath: string
  mpList: string[]
  experienceQrCodeUrl:string
  port: string
}

// declare module "download-git-repo" {
//   export default function download(
//     repo: string,
//     savePath: string,
//     data: Record<string, any> | null,
//     callback: (err: any) => void
//   ): void;
// }


// eslint-disable-next-line @typescript-eslint/naming-convention
interface DEPLOY_MP_EXPERIENCE {
  mpUploadKeyPath: string
  branch: string
  appid: string
  version: string
  buildCommand: string
  desc: string
  robot: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30
  projectId: number
  cliMethod: 'upload' | 'preview'
  buildType: 'tag' | 'commit'
  tagName: string
}