import { client } from "./App";
import { get_m3u8_tree } from "./folder";
import { get_children } from "./App";

function unique(arr: Array<string>) {//列表去重
    return arr.filter(function (item, index, arr) {
        //当前元素，在原始数组中的第一个索引==当前索引值，否则返回当前元素
        return arr.indexOf(item, 0) === index;
    });
}

function cleanData(text: string, res: string, blacklist: Array<string> = []) {
    let data: any = (unique((text + '\n' + res).split('\n'))).filter((i) => i.trim() != '')
    data = data.filter((i: string) => blacklist.indexOf(i) == -1)
    return data.join('\n')
}

export async function data_files_act({ regex_data_files, mode, item, tree, setTree }: any) {
    const userPlaylistPath = regex_data_files[1] + '/' + 'user_playlist' + '/' + regex_data_files[2] + '.m3u8'
    const videoPlaylistPath = regex_data_files[1] + '/' + 'videos.m3u8'
    // let downloadLink = client.getFileDownloadLink(p);
    switch (mode) {
        case 'addUser':
            async function get_dir() {
                const dir: any = await client.getDirectoryContents(regex_data_files[1] + '/' + 'data_files' + '/' + regex_data_files[2]);
                const res = dir.map((i: any) => i.filename.replace('/91porn', '..') + '\n').join('\n')
                return res
            }
            if (await client.exists(userPlaylistPath) === true) {
                const res = await get_dir()
                const text = await client.getFileContents(userPlaylistPath, { format: "text" });
                await client.putFileContents(userPlaylistPath, cleanData(text, res));
            } else {
                const res = await get_dir()
                await client.putFileContents(userPlaylistPath, cleanData("", res));
            }
            break
        case 'removeUser':
            if (await client.exists(userPlaylistPath) === true) {
                await client.deleteFile(userPlaylistPath);
            }
            break
        case 'likeVideo':
            if (await client.exists(videoPlaylistPath) === true) {
                const text = await client.getFileContents(videoPlaylistPath, { format: "text" });
                await client.putFileContents(videoPlaylistPath, cleanData(text, item.name.replace('/91porn/', './')));
            } else {
                await client.putFileContents(videoPlaylistPath, cleanData("", item.name.replace('/91porn/', './')));
            }
            break
        case 'downVideo':
            if (await client.exists(videoPlaylistPath) === true) {
                let text = await client.getFileContents(videoPlaylistPath, { format: "text" });
                await client.putFileContents(videoPlaylistPath, cleanData(text, "", item.name.replace('/91porn/', './')));
            }
            break
        case 'refresh':
            if (tree.type == 'directory') {
                if (tree.name.endsWith('.m3u8')) {
                    const newTree = await get_m3u8_tree(tree.name)
                    setTree(newTree)
                } else {
                    const newTree = await get_children(tree.name)
                    setTree(newTree)
                }
            }
            break
    }
}

function merger_name(name: string) {
    return name.replace(/(\/.+?)\.\.\/(.+)/, ($0, $1, $2) => $1.replace(/(.+\/)(.+)/, '$1') + $2)
}

export async function user_playlist_act({ regex_data_files, mode, item, tree, setTree }: any) {
    const videoDataPath = regex_data_files[1] + '/' + 'data_files' + '/' + regex_data_files[2].slice(0, regex_data_files[2] - 5)
    const videoPlaylistPath = regex_data_files[0]
    // let downloadLink = client.getFileDownloadLink(p);
    switch (mode) {
        case 'addUser':
            async function get_dir() {
                const dir: any = await client.getDirectoryContents(videoDataPath);
                const res = dir.map((i: any) => i.filename.replace('/91porn', '..') + '\n').join('\n')
                return res
            }
            const res = await get_dir()
            // const text = await client.getFileContents(userPlaylistPath, { format: "text" });
            // await client.putFileContents(userPlaylistPath, cleanData(text, res));

            break
    }
}
