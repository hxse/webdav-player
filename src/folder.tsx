import { useEffect, useRef } from 'react';
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
    return res.join('/').replace('/./', '/')
}

export async function get_m3u8_tree(path: string, blacklist: Array<string> = ['System Volume Information']) {
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


async function onclick(path: string, type: string, setTree: any, setUrl: any, setIdx: any, setVideoIdx: any, idx: number | null, setColorIdx: any, vdx: number | null, setCount: any, setVideoCount: any, setTree2: any) {
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
function Create_tree({ tree, setTree, setUrl, setIdx, setVideoIdx, setColorIdx, setCount, setVideoCount, colorIdx, myref }: any) {
    return tree?.children?.map((i: any, idx: number) => (
        <div key={idx} ref={(r) => myref.current[idx] = r} onClick={() => onclick(i.name, i.type, setTree, setUrl, setIdx, setVideoIdx, idx, setColorIdx, i.vdx, setCount, setVideoCount)}
            style={{
                "backgroundColor": idx == colorIdx ? "rgba(228, 228, 236, 0.5)" : "",
                // "boxShadow": "0 0 5px #333"
            }}
        >
            {i?.name?.split('/')?.at(-1)}

        </div>
    ))
}
export function Folder({ tree, setTree, tree2, setTree2, setUrl, setIdx, setVideoIdx, colorIdx, setColorIdx, setCount, setVideoCount, autoClick, setAutoClick }: any) {
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
                    <div onClick={() => onclick(parentPath, 'directory', setTree, setUrl, setIdx, setVideoIdx, null, setColorIdx, null, setCount, setVideoCount, setTree2)}>
                        {tree.name || '/'}
                    </div>
                    <Create_tree tree={tree} setTree={setTree} setUrl={setUrl} setIdx={setIdx} setVideoIdx={setVideoIdx} setColorIdx={setColorIdx} setCount={setCount} setVideoCount={setVideoCount} colorIdx={colorIdx} myref={ref} ></Create_tree>
                </div>
            )
            :
            (
                <div>
                    {/* <div onClick={() => onclick(parentPath, 'directory', setTree, setUrl, setIdx, setVideoIdx, null, setColorIdx, null, setCount, setVideoCount, setTree2)}>
                    {tree2.name || '/'}
                    </div> */}
                    <div>children page...{tree2.name.split('/').at(-1)}</div>
                    <Create_tree tree={tree2} setTree={setTree} setUrl={setUrl} setIdx={setIdx} setVideoIdx={setVideoIdx} setColorIdx={setColorIdx} setCount={setCount} setVideoCount={setVideoCount} colorIdx={colorIdx} myref={ref} ></Create_tree>
                </div>
            )
        }
    </div >
}
