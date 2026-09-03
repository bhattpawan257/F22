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


def organiseFolder(targetDir):
    fileLs=os.listdir(targetDir)
    exlist=[]
    for i in fileLs:
        path=os.path.join(targetDir,i)
        if os.path.isdir(path):
            continue
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
        exlist.append([i,target])
    print(exlist)
    for i in exlist:
        ipath=os.path.join(targetDir,i[0])
        destDir=os.path.join(targetDir,i[1])
        os.makedirs(destDir,exist_ok=True)
        shutil.move(ipath,os.path.join(destDir,i[0]))
        print(f"Moved: {i[0]} ==> {i[1]}")
        


organiseFolder("example")