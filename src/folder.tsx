import { useEffect, useRef } from 'react';
import { get_tree, get_children, client } from './App'
import { formatTranslation } from './App'
import { regex2 } from './video-react-player';
import { data_files_act } from './act';

export function create_url(path: string) {
    let downloadLink = client.getFileDownloadLink(path);
    return downloadLink
    downloadLink = window.location.href.slice(0, window.location.href.length - 1) + downloadLink
    return downloadLink
}

function merger_path(path: string, relativePath: string, mode = 'file') {
    let p = path.indexOf('/') == -1 ? path.split('\\') : path.split('/')
    let r = relativePath.indexOf('/') == -1 ? relativePath.split('\\') : relativePath.split('/')
    let res = [...p.slice(0, p.length - 1), ...r]
    if (r[0] == '..') {
        res = [...p.slice(0, mode == 'file' ? p.length - 2 : p.length - 1), ...r.slice(1, r.length)]
    }
    if (r[0] == '.') {
        res = [...p.slice(0, p.length - 1), ...r.slice(1, r.length)]
    }
    return res.join('/')
}

async function get_file(path: string): Promise<string> {
    // m3u8不刷新的话, 就刷新浏览器缓存, 没什么好办法
    // https://github.com/whatwg/fetch/issues/26 fetch不支持带@用户名密码的url,所以要写到header里面,或者直接清除掉
    let downloadLink: string = client.getFileDownloadLink(path);
    let url = downloadLink.indexOf('@') != -1 ? downloadLink.split('@')[0].split('//')[0] + '//' + downloadLink.split('@')[1] : downloadLink

    function get_auth(): {} {
        if (downloadLink.indexOf('@') != -1) {
            const username = downloadLink.split('@')[0].split('//')[1].split(':')[0]
            const password = downloadLink.split('@')[0].split('//')[1].split(':')[1]
            return {
                'Authorization': 'Basic ' + btoa(username + ":" + password)
            }
        }
        return {}
    }
    const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
        headers: {
            "Content-Type": "text/plain",
            ...get_auth()
        }
    });
    const res = await response.text();
    return res;
}

export async function get_m3u8_tree({ path, blacklist = ['System Volume Information'], refresh = false }: {
    path: string, blacklist?: Array<string>, refresh?: boolean
}) {
    const regex_data_files = path.match(regex2)
    if (refresh == true && regex_data_files) {
        await data_files_act({ regex_data_files: regex_data_files, mode: 'addUser' })//函数里面用了一个补丁
    }
    // const text: string = await client.getFileContents(path, { format: "text" });
    const text: string = await get_file(path)


    let children: any = text.split('\n').filter((i) => i != '')
    children = children.map((i) => ({ 'filename': merger_path(path, i.trim(), 'file'), 'type': 'file' }))
    children = children.filter((i: any) => blacklist.indexOf(i.filename.split('/').at(-1)) == -1)
    return {
        'name': path,
        'children': formatTranslation(children),
        'type': 'directory'
    }
}


async function onclick({ path, type, setTree, setUrl, setIdx, setVideoIdx, idx, setColorIdx, vdx, setCount, setVideoCount, setTree2, setUserName }: any) {
    if (type == 'root') {
        setVideoIdx(null)
        setColorIdx(null)
    }
    if (type == 'directory') {
        const tree = await get_children(path)
        setTree(tree)
        setVideoIdx(null)
        setColorIdx(null)
        setCount(tree.children.length)
        setVideoCount(tree.children.filter((i: any) => i.vdx != null).length)
    }
    if (type == 'file') {
        if (path.split('.').at(-1) == 'm3u8') {
            let tree = await get_m3u8_tree({ path: path, refresh: true })
            setTree(tree)
            setVideoIdx(null)
            setColorIdx(null)
            setCount(tree.children.length)
            setVideoCount(tree.children.filter((i: any) => i.vdx != null).length)
        } else {
            if (vdx != null) {
                setUrl(create_url(path))
            } else {
                setUrl('error')
            }
            setVideoIdx(vdx)
            setColorIdx(idx)
        }
    }
    if (type == 'm3u8') {
    }
    setIdx(idx)
    console.log('folder click')
}
function Create_tree({ tree, setTree, setTree2, setUrl, setIdx, setVideoIdx, setColorIdx, setCount, setVideoCount, colorIdx, myref, setUserName }: any) {
    return tree?.children?.map((i: any, idx: number) => (
        <div key={idx} ref={(r) => myref.current[idx] = r} onClick={() => onclick({ path: i.name, type: i.type, setTree, setUrl, setIdx, setVideoIdx, idx, setColorIdx, vdx: i.vdx, setCount, setVideoCount, setTree2, setUserName })}
            style={{
                "backgroundColor": idx == colorIdx ? "rgba(228, 228, 236, 0.5)" : "",
                // "boxShadow": "0 0 5px #333"
            }}
        >
            {i?.name?.split('/')?.at(-1)}

        </div>
    ))
}
export function Folder({ tree, setTree, tree2, setTree2, setUrl, setIdx, setVideoIdx, colorIdx, setColorIdx, setCount, setVideoCount, autoClick, setAutoClick, setUserName }: any) {
    const ref = useRef([]);
    console.log('folder')
    const _ = tree2 == null ? tree?.name?.split('/') : tree2?.name?.split('/')
    const parentPath = (_?.slice(0, _?.length - 1))?.join('/')
    useEffect(() => {
        if (autoClick != null) {
            ref.current?.[autoClick].click()
            ref.current?.[autoClick].scrollIntoViewIfNeeded({ behavior: 'instant' });
        }
    }, [autoClick])

    return <div className='folder'>

        {tree2 == null ?
            (
                <div>
                    <div onClick={() => onclick({ path: parentPath, type: 'directory', setTree, setUrl, setIdx, setVideoIdx, idx: null, setColorIdx, vdx: null, setCount, setVideoCount, setTree2, setUserName })}>
                        {tree.name || '/'}
                    </div>
                    <Create_tree tree={tree} setTree={setTree} setTree2={setTree2} setUrl={setUrl} setIdx={setIdx} setVideoIdx={setVideoIdx} setColorIdx={setColorIdx} setCount={setCount} setVideoCount={setVideoCount} colorIdx={colorIdx} myref={ref} setUserName={setUserName} ></Create_tree>
                </div>
            )
            :
            (
                <div>
                    {/* <div onClick={() => onclick(parentPath, 'directory', setTree, setUrl, setIdx, setVideoIdx, null, setColorIdx, null, setCount, setVideoCount, setTree2)}>
                    {tree2.name || '/'}
                    </div> */}
                    <div>children page...{tree2.name.split('/').at(-1)}</div>
                    <Create_tree tree={tree2} setTree={setTree} setTree2={setTree2} setUrl={setUrl} setIdx={setIdx} setVideoIdx={setVideoIdx} setColorIdx={setColorIdx} setCount={setCount} setVideoCount={setVideoCount} colorIdx={colorIdx} myref={ref} setUserName={setUserName}></Create_tree>
                </div>
            )
        }
    </div >
}
