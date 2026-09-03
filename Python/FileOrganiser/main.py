import os
import shutil

extensionMap = {
    "Images": ["jpg","png","jpeg","svg","heic","bmp"],
    "Videos": ["mp4","mov","mkv","hevc"],
    "Audios": ["mp3","ogg"],
    "Documents": ["pdf","doc","xlsx","txt"],
    "Archives": ["zip","7z"],
    "Packages": ["apk"]
}


def organiseFolder(path):
    fileLs=os.listdir(path)
    for i in fileLs:
        found=0
        nls=i.split(".")
        ext=nls[-1]
        for j in extensionMap:
            if ext.lower() in extensionMap[j]:
                found=1
                target=j
                break
        if not found:
            target="Others"
        print(i,target)


organiseFolder("example")