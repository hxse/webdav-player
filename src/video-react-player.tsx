import 'video-react/dist/video-react.css'; // import css
import { Player, ControlBar } from 'video-react';
import { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { create_url } from './folder'

function findItem(children: any, vdx: number | null) {
    for (let i of children) {
        if (i.vdx != null && i.vdx == vdx) {
            return i.idx
        }
    }
    return null
}

function onClick(mode: string, tree: any, videoIdx: number | null, setIdx: any, setUrl: any, setVideoIdx: any, setColorIdx: any, ref: any) {
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
    console.log('run VideoReactPlayer click', mode)
    // ref.current.toggleFullscreen()

}
export function VideoReactPlayer({ url, setUrl, tree, videoIdx, setIdx, setVideoIdx, setColorIdx, count, videoCount }: { url: string, setUrl: any, tree: any, videoIdx: number | null, setIdx: any, setVideoIdx: any, setColorIdx: any, count: number | null, videoCount: number | null }) {
    const ref = useRef();
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    console.log('run VideoReactPlayer')
    useEffect((i) => {
        if (videoIdx != null) {
            ref.current.load()
        }
    }, [videoIdx])

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
                    <button id="prev" onClick={() => onClick('prev', tree, videoIdx, setIdx, setUrl, setVideoIdx, setColorIdx, ref)}>prev{videoIdx == null || videoCount == null ? '' : videoIdx}</button>
                    <button id="next" onClick={() => onClick('next', tree, videoIdx, setIdx, setUrl, setVideoIdx, setColorIdx, ref)}>next{videoIdx == null || videoCount == null ? '' : videoCount - videoIdx - 1}</button>
                </ControlBar>
            </Player >
        </div >
    )
}

