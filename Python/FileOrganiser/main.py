import os
import shutil

extensionMap = {
    "Images": ["jpeg","jpg","png","gif","webp","bmp","tiff","tif","svg","ico","heic","heif","avif","raw","cr2","nef","arw","dng","psd","ai","eps","tga","ppm","pgm","pbm","pnm","dds","exr","hdr"],
    "Videos": ["mp4", "mkv", "mov", "avi", "wmv", "flv", "webm", "m4v", "mpg", "mpeg", "3gp", "3g2", "ogv", "vob", "ts", "m2ts", "mts", "divx", "rm", "rmvb", "asf"],
    "Audios": ["mp3", "wav", "aac", "flac", "ogg", "m4a", "wma", "aiff", "alac", "opus", "amr", "mid", "midi"],
    "Documents": ["pdf", "doc", "docx", "txt", "rtf", "odt", "pages", "xls", "xlsx", "csv", "ods", "numbers", "ppt", "pptx", "odp", "key", "epub", "mobi", "md", "tex"],
    "Archives": ["zip", "rar", "7z", "tar", "gz", "bz2", "xz", "iso", "dmg", "tgz", "tbz2", "z", "cab"],
    "Packages": ["deb", "rpm", "pkg", "msi", "exe", "apk", "appx", "dmg", "whl", "jar", "flatpak", "snap"]

}


def organiseFolder(targetDir):
    if not os.path.exists(targetDir):
        print(f"{targetDir} does not exists")
        return
    fileLs=os.listdir(targetDir)
    exlist=[]
    for i in fileLs:
        path=os.path.join(targetDir,i)
        if os.path.isdir(path):
            continue
        found=0
        nls=os.path.splitext(i)
        ext=nls[-1][1:]
        for j,k in extensionMap.items():
            if ext.lower() in k:
                found=1
                target=j
                break
        if not found:
            target="Others"
        exlist.append([i,target])
    images=videos=audios=archives=packages=others=docs=0
    for i in exlist:
        print(i[0], i[1])
        match i[1]:
            case "Images":
                images+=1
            case "Videos":
                videos+=1
            case "Audios":
                audios+=1
            case "Archives":
                archives+=1
            case "Packages":
                packages+=1
            case "Documents":
                docs+=1
            case _:
                others+=1
    print(f"found \nImages:{images}\nVideos:{videos}\nAudios:{audios}\ndocuments:{docs}\nArchives:{archives}\nPackages:{packages}\nOthers:{others}")
    c=input("continue(y/n)")
    if c in "Nn":
        return 0
    for i in exlist:
        ipath=os.path.join(targetDir,i[0])
        destDir=os.path.join(targetDir,i[1])
        os.makedirs(destDir,exist_ok=True)
        newPath=os.path.join(destDir,i[0])
        while True:
            skip=0
            if os.path.exists(newPath):
                print(f"{i[0]} already exists in {i[1]}")
                print("what you want to do \n1. rename\n2. custom name\n3. Skip")
                ch=input("Enter your choice: ")
                match ch:
                    case "1":
                        newName=i[0]+"_1"
                        os.rename(i[0],newName)
                        ipath=os.path.join(targetDir,newName)
                        newPath=os.path.join(destDir,newName)
                        break
                    case "2":
                        newName=input(f"Enter the new name for {i[0]}")
                        os.rename(i[0],newName)
                        ipath=os.path.join(targetDir,newName)
                        newPath=os.path.join(destDir,newName)
                        break
                    case "3":
                        skip=1
                        break
                    case _:
                        input("invalid choice")

            else:
                break
        if not skip:
            shutil.move(ipath,newPath)
            print(f"Moved: {i[0]} ==> {i[1]}")
        

def main():
    dirs=input("enter directory name :")
    organiseFolder(dirs)

main()