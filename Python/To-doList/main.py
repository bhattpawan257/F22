import pickle
listFile=open("toDoList.dat","rb+")

def addToList():
    rdObj=pickle.load(listFile)
    rdObj.append(task)
    pickle.dump(rdObj,listFile)

def popTask():
    rdObj=pickle.load(listFile)
    rdObj.pop()
    pickle.dump(rdObj,listFile)

def displayList():
    rdObj=pickle.load(listFile)
    for i in rdObj:
        print(i)


def main():
    while True
        print("\t\t\tMain Menu")
        print("1. Add a new task")
        print("2. Display the task list")
        print("3. Pop task")
        print("4. Quit")
        ch=input("Enter Your Choice")
        match ch:
            case "1":
                addToList()
            case "2":
                displayList()
            case "3":
                popTask()
            case "4":
                break
            case _:
                print("Invalid choice")