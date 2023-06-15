import { useState, useEffect } from 'react'
import { AuthType, createClient } from "webdav";
import { Folder } from './folder'
import { VideoReactPlayer } from './video-react-player';


const videoSuffix = ['.mp4', '.mov', '.MOV']

export function checkVideoSuffix(path: string, type: string) {
  for (let i of videoSuffix) {
    if (path.endsWith(i) && type == 'file') {
      return true
    }
  }
  return false
}

function changeURLArg(url, arg, arg_val) {
  var pattern = arg + '=([^&]*)';
  var replaceText = arg + '=' + arg_val;
  if (url.match(pattern)) {
    var tmp = '/(' + arg + '=)([^&]*)/gi';
    tmp = url.replace(eval(tmp), replaceText);
    return tmp;
  } else {
    if (url.match('[\?]')) {
      return url + '&' + replaceText;
    } else {
      return url + '?' + replaceText;
    }
  }
}
// 示例url,搭建一个8085端口的webdav,挂载到/e目录
// http://127.0.0.1:3000/?apiUrl=http://192.168.1.102:8085&&username=user&&password=asdf&path=e,f&num=0
const queryParameters = new URLSearchParams(window.location.search)
const apiUrl = queryParameters.get("apiUrl")
const username = queryParameters.get("username")
const password = queryParameters.get("password")
const path = queryParameters.get("path")
const num = queryParameters.get("num")

export const client = createClient(apiUrl + '/' + path?.split(',')[num == null ? 0 : parseInt(num)], {
  authType: AuthType.Password,
  username: username,
  password: password
});
export function formatTranslation(children: any) {
  children = children.map((i: any) => ({ 'name': i.filename, 'type': i.type }))
  let vdx = 0
  for (let i = 0; i < children.length; i++) {
    children[i]['idx'] = i
    if (checkVideoSuffix(children[i].name, children[i].type)) {
      children[i]['vdx'] = vdx
      vdx += 1
    } else {
      children[i]['vdx'] = null
    }
  }
  return children
}
export async function get_children(path: string, blacklist: Array<string> = ['System Volume Information']) {
  let children: any = await client.getDirectoryContents(path)
  children = children.filter((i: any) => blacklist.indexOf(i.filename.split('/').at(-1)) == -1)
  return {
    'name': path,
    'children': formatTranslation(children),
    'type': 'directory'
  }
}
export async function get_tree(path: string, recursion = 2, obj: any = {}, blacklist: Array<string> = ['System Volume Information']) {
  // path需要传入文件夹, 不要传入文件
  obj['name'] = path
  obj['children'] = []
  obj['type'] = 'directory'

  const item: any = await client.getDirectoryContents(path);
  for (let i of item) {
    const res: any = {}
    if (i.type == 'directory') {
      if (recursion > 1 && blacklist.indexOf(i.filename.split('/').at(-1)) == -1) {
        await get_tree(i.filename, recursion - 1, res)
      }
      else {
        res['name'] = i.filename
      }
      res['type'] = i.type
    }
    if (i.type == 'file') {
      res['type'] = i.type
      res['name'] = i.filename
      let downloadLink = client.getFileDownloadLink(i.filename);
      downloadLink = window.location.href.slice(0, window.location.href.length - 1) + downloadLink
      res['url'] = downloadLink
    }
    obj['children'].push(res)
  }
  return obj
}

function App() {
  const [idx, setIdx] = useState<number | null>(null)
  const [videoIdx, setVideoIdx] = useState<number | null>(null)
  const [count, setCount] = useState<number | null>(null)
  const [videoCount, setVideoCount] = useState<number | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [url, setUrl] = useState<string>('')
  const [tree, setTree] = useState<object>({})
  const [tree2, setTree2] = useState<object | null>(null)
  const [colorIdx, setColorIdx] = useState<number | null>(null)
  const [autoClick, setAutoClick] = useState<number | null>(null)
  useEffect(() => {
    async function run_tree() {
      const tree = await get_children('/')
      setTree(tree)
    }
    run_tree()
    console.log('run App useEffect')
  }, [])
  console.log('run App')
  return (
    <div>
      <div>
        <div style={{ "whiteSpace": "nowrap" }}>
          {path?.split(',').map((i, idx) =>
            <a key={idx} href={changeURLArg(window.location.href, 'num', idx)}>
              ➹{i}&nbsp;
            </a>
          )}
        </div >
        <div style={{ "whiteSpace": "nowrap" }}>
          idx: {idx} &nbsp;
          videoIdx: {videoIdx} &nbsp;
          count: {count} &nbsp;
          videoCount: {videoCount} &nbsp;
          userName: {url && url != 'error' ? decodeURI(url).split('/').at(-2) : ''} &nbsp;
        </div>
      </div >
      <div>
        <Folder tree={tree} setTree={setTree} tree2={tree2} setTree2={setTree2} setUrl={setUrl} setIdx={setIdx} setVideoIdx={setVideoIdx} colorIdx={colorIdx} setColorIdx={setColorIdx} setCount={setCount} setVideoCount={setVideoCount} autoClick={autoClick} setAutoClick={setAutoClick} setUserName={setUserName} />
      </div>
      <br />
      {
        !url ? undefined : url == 'error' ? <h1>'play video error'</h1> :
          <div
          >
            <VideoReactPlayer url={url} setUrl={setUrl} tree={tree} setTree={setTree} tree2={tree2} setTree2={setTree2} setIdx={setIdx} setVideoIdx={setVideoIdx} videoIdx={videoIdx} setColorIdx={setColorIdx} count={count} videoCount={videoCount} autoClick={autoClick} setAutoClick={setAutoClick} />
          </div>
      }
    </div >
  )
}

export default App
