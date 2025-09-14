import ReactPlayer from 'react-player';
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

export const regex1 = /(\/91porn)\/data_files\/(.*)\/(.*mp4)/
export const regex2 = /(\/91porn)\/user_playlist\/(.*m3u8)/

export async function onAddOrRemoveUser({ tree, tree2, videoIdx, mode, setTree, setTree2 }: any) {
    tree = tree2 == null ? tree : tree2
    setTree = tree2 == null ? setTree : setTree2
    console.log(videoIdx, tree, tree2)
    let number = videoIdx == null ? null : findItem(tree.children, videoIdx)
    let item = number == null ? null : tree.children[number]
    if (item?.type == 'file') {
        const regex_data_files = item.name.match(regex1)
        const regex_data_files2 = item.name.match(regex2)
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
                            newTree: await get_m3u8_tree({ path: '/91porn/videos.m3u8' })
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


// export function VideoReactPlayer({ url, setUrl, tree, setTree, tree2, setTree2, videoIdx, setIdx, setVideoIdx, setColorIdx, count, videoCount, autoClick, setAutoClick }: any) {
//     const playerRef = useRef(null);
//     const backWardRef = useRef(null);
//     const [width, setWidth] = useState(0);
//     const [playing, setPlaying] = useState(true); // 控制播放状态
//     const [volume, setVolume] = useState(0.8); // 控制音量

//     // 播放器加载逻辑
//     useEffect(() => {
//         // 播放器加载逻辑在 ReactPlayer 中由 url prop 自动处理
//         // 当 url 改变时，ReactPlayer 会自动加载新视频
//     }, [url]);

//     // 窗口大小调整逻辑
//     useLayoutEffect(() => {
//         function handleResize() {
//             setWidth(document.documentElement.clientWidth * 0.98);
//         }
//         window.addEventListener('resize', handleResize);
//         handleResize();
//         return () => window.removeEventListener('resize', handleResize);
//     }, []);

//     console.log('run VideoReactPlayer', playerRef == null);
//     console.log('url', url);

//     return (
//         <div className='video-player'>
//             <ReactPlayer
//                 ref={playerRef}
//                 // url={url}
//                 url="http://hxse:asdf@192.168.10.110:3923/91porn/data_files/122417/2021-08-22%20%E5%BE%88%E5%B0%8F%E7%9A%84%E5%A6%B9%E5%A6%B9%20e13298342353c3953486.mp4"
//                 playing={playing}
//                 controls={true} // 启用默认的播放器控制条
//                 width={width + 'px'}
//                 height='auto'
//                 volume={volume}
//                 // 当视频加载完成或URL改变时自动播放
//                 onReady={() => console.log('Player ready')}
//             // 你可以根据需要添加更多事件处理函数
//             // onPlay={() => setPlaying(true)}
//             // onPause={() => setPlaying(false)}
//             />

//             <div className="float" >
//                 <button id="prev" className='float-button' onClick={() => onClick({ mode: 'prev', tree, tree2, videoIdx, setIdx, setUrl, setVideoIdx, setColorIdx, ref: playerRef, setAutoClick })}>prev{videoIdx == null || videoCount == null ? '' : videoIdx}</button>
//                 <button id="next" className='float-button' onClick={() => onClick({ mode: 'next', tree, tree2, videoIdx, setIdx, setUrl, setVideoIdx, setColorIdx, ref: playerRef, setAutoClick })}>next{videoIdx == null || videoCount == null ? '' : videoCount - videoIdx - 1}</button>
//                 <button id="like" className='float-button' onClick={() => onAddOrRemoveUser({ tree, tree2, videoIdx, mode: 'likeVideo' })}>like</button>
//                 <button id="down" className='float-button' onClick={() => onAddOrRemoveUser({ tree, tree2, videoIdx, mode: 'downVideo' })}>down</button>
//                 <button id="switchVideo" className='float-button' onClick={() => onSwitchUser({ tree, tree2, setTree, setTree2, videoIdx, setVideoIdx, backWardRef, autoClick, setAutoClick, mode: 'video' })}>switchVideo</button>
//                 <button id="addUser" className='float-button' onClick={() => onAddOrRemoveUser({ tree, tree2, videoIdx, mode: 'addUser' })}>addUser</button>
//                 <button id="removeUser" className='float-button' onClick={() => onAddOrRemoveUser({ tree, tree2, videoIdx, mode: 'removeUser' })}>removeUser</button>
//                 <button id="switchUser" className='float-button' onClick={() => onSwitchUser({ tree, tree2, setTree, setTree2, videoIdx, setVideoIdx, backWardRef, autoClick, setAutoClick, mode: 'user' })}>switchUser</button>
//                 <button id="backWard" className='float-button' onClick={() => onBackWard({ tree, tree2, setTree, setTree2, videoIdx, setVideoIdx, backWardRef, autoClick, setAutoClick })}>backWard</button>
//                 <button id="refresh" className='float-button' onClick={() => onAddOrRemoveUser({ tree, tree2, videoIdx, mode: 'refresh', setTree, setTree2 })}>refresh</button>
//             </div>
//         </div>
//     );
// }

export function VideoReactPlayer({ url, setUrl, tree, tree2, videoIdx, setIdx, setVideoIdx, setColorIdx, videoCount, autoClick, setAutoClick }: any) {
    const videoRef = useRef(null);
    const backWardRef = useRef(null);
    const [width, setWidth] = useState(0);

    // 窗口大小调整逻辑
    useLayoutEffect(() => {
        function handleResize() {
            // 获取父容器的宽度，而不是整个文档的宽度
            const parentWidth = document.documentElement.clientWidth;
            // 将视频宽度设置为父容器的 98%
            setWidth(parentWidth * 0.98);
        }
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    console.log('run VideoReactPlayer');
    console.log('url', url);

    return (
        <div className='video-player'>
            <video
                ref={videoRef}
                src={url}
                controls
                autoPlay
                style={{
                    width: '100%', // 将宽度设置为 100%
                    height: '100%', // 高度按比例自适应
                    // maxWidth: width + 'px' // 设置最大宽度
                    objectFit: 'contain'
                }}
            />

            <div className="float">
                <button id="prev" className='float-button' onClick={() => onClick({ mode: 'prev', tree, tree2, videoIdx, setIdx, setUrl, setVideoIdx, setColorIdx, ref: videoRef, setAutoClick })}>
                    prev{videoIdx == null || videoCount == null ? '' : videoIdx}
                </button>
                <button id="next" className='float-button' onClick={() => onClick({ mode: 'next', tree, tree2, videoIdx, setIdx, setUrl, setVideoIdx, setColorIdx, ref: videoRef, setAutoClick })}>
                    next{videoIdx == null || videoCount == null ? '' : videoCount - videoIdx - 1}
                </button>
                <button id="like" className='float-button' onClick={() => onAddOrRemoveUser({ tree, tree2, videoIdx, mode: 'likeVideo' })}>like</button>
                <button id="down" className='float-button' onClick={() => onAddOrRemoveUser({ tree, tree2, videoIdx, mode: 'downVideo' })}>down</button>
                <button id="switchVideo" className='float-button' onClick={() => onSwitchUser({ tree, tree2, setTree, setTree2, videoIdx, setVideoIdx, backWardRef, autoClick, setAutoClick, mode: 'video' })}>switchVideo</button>
                <button id="addUser" className='float-button' onClick={() => onAddOrRemoveUser({ tree, tree2, videoIdx, mode: 'addUser' })}>addUser</button>
                <button id="removeUser" className='float-button' onClick={() => onAddOrRemoveUser({ tree, tree2, videoIdx, mode: 'removeUser' })}>removeUser</button>
                <button id="switchUser" className='float-button' onClick={() => onSwitchUser({ tree, tree2, setTree, setTree2, videoIdx, setVideoIdx, backWardRef, autoClick, setAutoClick, mode: 'user' })}>switchUser</button>
                <button id="backWard" className='float-button' onClick={() => onBackWard({ tree, tree2, setTree, setTree2, videoIdx, setVideoIdx, backWardRef, autoClick, setAutoClick })}>backWard</button>
                <button id="refresh" className='float-button' onClick={() => onAddOrRemoveUser({ tree, tree2, videoIdx, mode: 'refresh', setTree, setTree2 })}>refresh</button>
            </div>
        </div>
    );
}
