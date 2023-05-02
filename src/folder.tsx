import { get_tree, get_children, client } from './App'
import { formatTranslation } from './App'

export function create_url(path: string) {
    let downloadLink = client.getFileDownloadLink(path);
    return downloadLink
    downloadLink = window.location.href.slice(0, window.location.href.length - 1) + downloadLink
    return downloadLink
}

function merger_path(path, relativePath, mode = 'file') {
    let p = path.split('/')
    let r = relativePath.split('\\')
    let n = 0
    for (let i of relativePath.split('\\')) {
        if (i != '..') {
            break
        }
        n += 1
    }
    let res = [...p.slice(0, mode == 'file' ? -n - 1 : -n), ...r.slice(n, r.length)]
    return res.join('/')
}

async function get_m3u8_tree(path: string, blacklist: Array<string> = ['System Volume Information']) {
    const text: string = await client.getFileContents(path, { format: "text" });
    let children: any = text.split('\n').filter((i) => i != '')
    children = children.map((i) => ({ 'filename': merger_path(path, i.trim(), 'file'), 'type': 'file' }))
    children = children.filter((i: any) => blacklist.indexOf(i.filename.split('/').at(-1)) == -1)
    return {
        'name': path,
        'children': formatTranslation(children),
        'type': 'directory'
    }
}


async function onclick(path: string, type: string, setTree: any, setUrl: any, setIdx: any, setVideoIdx: any, idx: number | null, setColorIdx: any, vdx: number | null, setCount: any, setVideoCount: any) {
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
            let tree = await get_m3u8_tree(path)
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
export function Folder({ tree, setTree, setUrl, setIdx, setVideoIdx, colorIdx, setColorIdx, setCount, setVideoCount }: any) {
    console.log('folder')
    const _ = tree?.name?.split('/')
    const parentPath = (_?.slice(0, _?.length - 1))?.join('/')
    return <div className='folder'>
        <div onClick={() => onclick(parentPath, 'directory', setTree, setUrl, setIdx, setVideoIdx, null, setColorIdx, null, setCount, setVideoCount)}>
            {tree.name || '/'}
        </div>
        {tree?.children?.map((i: any, idx: number) => (
            <div key={idx} onClick={() => onclick(i.name, i.type, setTree, setUrl, setIdx, setVideoIdx, idx, setColorIdx, i.vdx, setCount, setVideoCount)}
                style={{
                    "backgroundColor": idx == colorIdx ? "rgba(228, 228, 236, 0.5)" : "",
                    // "boxShadow": "0 0 5px #333"
                }}
            >
                {i?.name?.split('/')?.at(-1)}

            </div>
        ))
        }
    </div >
}
