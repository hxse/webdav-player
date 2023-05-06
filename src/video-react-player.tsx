import 'video-react/dist/video-react.css'; // import css
import { Player, ControlBar, Shortcut, BigPlayButton } from 'video-react';
import { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { create_url } from './folder'
import { shortcuts } from './config';
import { playlistConfig } from "./config"
import { get_children, client } from './App';
import { memo } from 'react'
import { get_m3u8_tree } from './folder';
import { data_files_act, user_playlist_act } from './act';

//todo video-react不维护了, 所以用这个重构  https://github.com/CookPete/react-player


function findItem(children: any, vdx: number | null) {
    for (let i of children) {
        if (i.vdx != null && i.vdx == vdx) {
            return i.idx
        }
    }
    return null
}

function onClick({ mode, tree, tree2, videoIdx, setIdx, setUrl, setVideoIdx, setColorIdx, ref, setAutoClick }: any) {
    tree = tree2 == null ? tree : tree2

    if (videoIdx == null) {
        return
    }

    const newVideoIdx = mode == 'next' ? videoIdx + 1 : videoIdx - 1
    let number = videoIdx == null ? null : findItem(tree.children, newVideoIdx)
    if (number == null) {
        return
    }

    const name = tree.children[number]?.name
    setUrl(create_url(name))
    setVideoIdx(newVideoIdx)
    setColorIdx(number)
    setIdx(number)
    setAutoClick(number)
    console.log('run VideoReactPlayer click', mode)
    // ref.current.toggleFullscreen()
}

function onLike({ tree, tree2, videoIdx }: any) {
    tree = tree2 == null ? tree : tree2

    let number = videoIdx == null ? null : findItem(tree.children, videoIdx)
    let item = tree.children[number]
    console.log(item)
}

function onDown({ tree, tree2, videoIdx }: any) {
    tree = tree2 == null ? tree : tree2

    let number = videoIdx == null ? null : findItem(tree.children, videoIdx)
    let item = number == null ? null : tree.children[number]
    if (item?.type == 'file') {
        let name = item.name
        switch (true) {
            case name.startsWith('/91porn/data_files/'):
                console.log(name)
                break;
            default:
                break;
        }
    }
}


async function onAddOrRemoveUser({ tree, tree2, videoIdx, mode, setTree, setTree2 }: any) {
    tree = tree2 == null ? tree : tree2
    setTree = tree2 == null ? setTree : setTree2
    console.log(videoIdx, tree, tree2)
    let number = videoIdx == null ? null : findItem(tree.children, videoIdx)
    let item = number == null ? null : tree.children[number]
    if (item?.type == 'file') {
        const regex_data_files = item.name.match(/(\/91porn)\/data_files\/(.*)\/(.*mp4)/)
        const regex_data_files2 = item.name.match(/(\/91porn)\/user_playlist\/(.*m3u8)/)
        switch (true) {
            case regex_data_files != null:
                //todo 这个地方很麻烦, 还是用配置文件去定义吧
                data_files_act({ regex_data_files: regex_data_files, mode: mode, item, tree, setTree })
                break
            case regex_data_files2 != null:
                //这个没有必要, 应该根本用不上
                debugger
                user_playlist_act({ regex_data_files: regex_data_files2, mode: mode, item, tree, setTree })
                break
            default:
                break;
        }
    }
}

function get_name(path: string) {
    const reg = /(.*)\/(.*)/
    const r = path.match(reg)
    return r == null ? null : r[2]
}

function find_idx(children: [any], path: string) {
    const name = get_name(path)
    if (name == null) return null
    for (let i = 0; i < children.length; i++) {
        let v = children[i]
        if (get_name(v.name) == name) {
            return i
        }
    }
    return null
}

async function onSwitchUser({ tree, videoIdx, setTree, setVideoIdx, backWardRef, tree2, setTree2, autoClick, setAutoClick, mode }: any) {
    //todo, 如果不只是用tree2, 甚至用idx2, videoIdx2, 等, 把所有的状态都做个2号, 会更好, 现在是只用tree2, idx2都是计算出来的, 所以用jotai重构一下会更好
    let number = videoIdx == null ? null : findItem(tree.children, videoIdx)
    let item = number == null ? null : tree.children[number]
    if (item?.type == 'file') {
        const r = item.name.match(/(\/91porn\/data_files\/.*)\/(.*)/)
        if (r != null) {
            if (backWardRef.current != null) {
                return
            }
            async function getData() {
                switch (mode) {
                    case 'user':
                        return {
                            dirPath: r[1],
                            newTree: await get_children(r[1])
                        }
                    case 'video':
                        return {
                            dirPath: '/91porn/videos.m3u8',
                            newTree: await get_m3u8_tree('/91porn/videos.m3u8')
                        }
                }
            }
            const data = await getData()
            if (data == undefined) return
            const { dirPath, newTree } = data
            setTree2(newTree)
            backWardRef.current = item.name //页面1的path name写这里,string
            const i = find_idx(newTree.children, backWardRef.current)
            if (i != null) {
                console.log(4444444444, i,)
                setAutoClick(i)
            }
        }
    }
}

async function onBackWard({ tree, videoIdx, setTree, setVideoIdx, backWardRef, tree2, setTree2, autoClick, setAutoClick }: any) {
    if (backWardRef.current == null) {
        return
    }
    setTree2(null)
    const i = find_idx(tree.children, backWardRef.current)
    if (i != null) {
        console.log(23333, i,)
        setAutoClick(i)
        backWardRef.current = null
    }
}

export function VideoReactPlayer({ url, setUrl, tree, setTree, tree2, setTree2, videoIdx, setIdx, setVideoIdx, setColorIdx, count, videoCount, autoClick, setAutoClick }: any) {
    const ref = useRef();
    const backWardRef = useRef();
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    console.log('run VideoReactPlayer', ref == undefined)
    useEffect(() => {
        console.log(ref)
        if (videoIdx != null) {
            ref.current.load()
        }
    }, [url])

    useLayoutEffect(() => {
        function handleResize() {
            setWidth(document.documentElement.clientWidth * 0.98)
            setHeight(document.documentElement.clientHeight * 0.6)
        }
        window.addEventListener('resize', handleResize)
        console.log('set handleResize')
        handleResize()
    }, [])

    console.log('全屏', document.documentElement.clientHeight)
    return (
        <div className='video-player'>
            <Player ref={ref} autoPlay={true} playsInline={false} width={width} height={height} fluid={false} >
                <source src={url} />

                <ControlBar autohide={false}>
                    <div className="float" >
                        <button id="prev" className='float-button' onClick={() => onClick({ mode: 'prev', tree, tree2, videoIdx, setIdx, setUrl, setVideoIdx, setColorIdx, ref, setAutoClick })}>prev{videoIdx == null || videoCount == null ? '' : videoIdx}</button>
                        <button id="next" className='float-button' onClick={() => onClick({ mode: 'next', tree, tree2, videoIdx, setIdx, setUrl, setVideoIdx, setColorIdx, ref, setAutoClick })}>next{videoIdx == null || videoCount == null ? '' : videoCount - videoIdx - 1}</button>
                        <button id="like" className='float-button' onClick={() => onAddOrRemoveUser({ tree, tree2, videoIdx, mode: 'likeVideo' })}>like</button>
                        <button id="down" className='float-button' onClick={() => onAddOrRemoveUser({ tree, tree2, videoIdx, mode: 'downVideo' })}>down</button>
                        <button id="switchVideo" className='float-button' onClick={() => onSwitchUser({ tree, tree2, setTree, setTree2, videoIdx, setVideoIdx, backWardRef, autoClick, setAutoClick, mode: 'video' })}>switchVideo</button>
                        <button id="addUser" className='float-button' onClick={() => onAddOrRemoveUser({ tree, tree2, videoIdx, mode: 'addUser' })}>addUser</button>
                        <button id="removeUser" className='float-button' onClick={() => onAddOrRemoveUser({ tree, tree2, videoIdx, mode: 'removeUser' })}>removeUser</button>
                        <button id="switchUser" className='float-button' onClick={() => onSwitchUser({ tree, tree2, setTree, setTree2, videoIdx, setVideoIdx, backWardRef, autoClick, setAutoClick, mode: 'user' })}>switchUser</button>
                        <button id="backWard" className='float-button' onClick={() => onBackWard({ tree, tree2, setTree, setTree2, videoIdx, setVideoIdx, backWardRef, autoClick, setAutoClick })}>backWard</button>
                        <button id="refresh" className='float-button' onClick={() => onAddOrRemoveUser({ tree, tree2, videoIdx, mode: 'refresh', setTree, setTree2 })}>refresh</button>
                    </div>
                </ControlBar>

                <Shortcut clickable={false} dblclickable={false} shortcuts={shortcuts} />
                <BigPlayButton disabled position="center" />
            </Player >
        </div >
    )
}

